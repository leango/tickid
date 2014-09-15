var jQT = new $.jQT({
    icon: 'jqtouch.png',
    icon4: 'jqtouch4.png',
    addGlossToIcon: false,
    startupScreen: 'jqt_startup.png',
    statusBar: 'black-translucent',
    preloadImages: []
});
var g_24hour = 86400000;
var g_params = {};
window.location.search.substr(1).split('&').forEach(function(str) {
  var pars = str.split('=');
  g_params[pars[0]] = pars[1];
});
var MyApp = new Backbone.Marionette.Application();

MyApp.addRegions({
  toolbarRegion: '#title',
  timelineRegion: '#timeline'
});
MyApp.commands.setHandler('loadTimeline', function(year, month) {
  console.log('loadTimeline', year, month);
  var now = new Date();
  var currentMonth = (year === now.getYear() + 1900 && month === now.getMonth() + 1);
  var dailyTicks = [];
  if (currentMonth) {
    var currentDate = now.getDate();
    for(var i=0; i<currentDate; ++i) {
      dailyTicks.push(createDailyTicks(now));
      now = new Date(now - g_24hour);
    }
  } else {
    var totalDays = daysInMonth(year, month);
    var date = new Date(year, month, 0);
    for(var i=0; i<totalDays; ++i) {
      dailyTicks.push(createDailyTicks(date));
      date = new Date(date - g_24hour);
    }
  }
  MyApp.trigger('timeline:load', new Timeline(dailyTicks));
});

var DailyTick = Backbone.Model.extend({
  defaults: {
    ticks: '&nbsp;'
  },
  sync: function() {
    var self = this;
    $.get('/api/v1/ticks', {
      user: g_params.user,
      year: this.get('year'),
      month: this.get('month'),
      date: this.get('date'),
      timezoneOffset: this.get('timezoneOffset')
    }, function(data) {
      self.set('ticks', parseInt(data.ticks));
    });
  }
});
var App = Backbone.Model.extend({
  addMonth: function(inc) {
    var month = this.get('month');
    var year = this.get('year');
    if (inc > 0) month ++;
    else month --;
    if (month === 13) {
      this.set({
        month: 1,
        year: year + 1
      });
    } else if (month === 0) { 
      this.set({
        month: 12,
        year: year - 1
      });
    } else {
      this.set('month', month);
    }
  },
  hasNextMonth: function() {
    return !isCurrentMonth(this.get('year'), this.get('month'));
  },
  hasPrevMonth: function() {
    return true;
  }
});
var Timeline = Backbone.Collection.extend({
  model: DailyTick,
});
var DailyTickView = Backbone.Marionette.ItemView.extend({
  template: '#dailytick-template',
  tagName: 'li',
  ui: {
    counterLabel: 'small.counter'
  },
  initialize: function() {
    var self = this;
    this.listenTo(this.model, 'change:ticks', function() {
      self.render();
    });
    this.model.sync();
  }
});
var TimelineView = Backbone.Marionette.CompositeView.extend({
  template: '#timeline-template',
  tagName: 'ul',
  className: 'scroll edgetoedge',
  itemView: DailyTickView,
  initialize: function() {
    var self = this;
    MyApp.on('timeline:load', function(timeline) {
      self.collection = timeline;
      self.render();
    });
  }
});
var ToolbarView = Backbone.Marionette.ItemView.extend({
  template: '#toolbar-template',
  tagName: 'div',
  className: 'toolbar',
  ui: {
    nextMonthButton: '#next-month',
    prevMonthButton: '#prev-month'
  },
  events: {
    'click @ui.nextMonthButton': 'nextMonth',
    'click @ui.prevMonthButton': 'prevMonth'
  },
  nextMonth: function() {
    this.model.addMonth(1);
  },
  prevMonth: function() {
    this.model.addMonth(-1);
  },
  initialize: function() {
    var self = this;
    this.listenTo(this.model, 'change:month', function() {
      clearTimeout(self.pid);
      self.pid = setTimeout(function() {
        MyApp.commands.execute('loadTimeline', self.model.get('year'), self.model.get('month'));
      }, 500);
      self.render();
    });
    this.on('render', function() {
      if (!self.model.hasNextMonth()) {
        $(self.ui.nextMonthButton).hide();
      }
      if (!self.model.hasPrevMonth()) {
        $(self.ui.prevMonthButton).hide();
      }
    });
  }
});
MyApp.addInitializer(function(options) {
  var timelineView = new TimelineView();
  var toolbarView = new ToolbarView({
    model: new App(options.app)
  });
  MyApp.toolbarRegion.show(toolbarView);
  MyApp.timelineRegion.show(timelineView);
});
$(function() {
  var dailyTicks = [];
  var now = new Date();
  var now = new Date();
  var app = {
    year: now.getYear() + 1900,
    month: now.getMonth() + 1
  };
  MyApp.start({
    app: app
  });
  MyApp.commands.execute('loadTimeline', app.year, app.month);
});



function createDailyTicks(date) {
  return {
    year: date.getYear() + 1900,
    month: date.getMonth() + 1,
    date: date.getDate(),
    dateStr: getDateStr(date),
    timezoneOffset: date.getTimezoneOffset()
  };
}
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
function isCurrentMonth(year, month) {
  var now = new Date();
  return now.getYear() + 1900 === year && now.getMonth() + 1 === month;
}
function isCurrentDate(year, month, date) {
  var now = new Date();
  return now.getYear() + 1900 === year 
    && now.getMonth() + 1 === month
    && now.getDate() === date;
}
function getDateStr(date) {
  if(isCurrentDate(date.getYear() + 1900,
    date.getMonth() + 1,
    date.getDate())) 
    return '今天';
  return date.getDate() + '日';
}
