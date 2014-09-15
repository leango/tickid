var models = require('./models');
var moment = require('moment');
var wechat = require('wechat');
var g_contentReg = /^(\/::\)|\/::~|\/::B|\/::\||\/:8-\)|\/::<|\/::$|\/::X|\/::Z|\/::'\(|\/::-\||\/::@|\/::P|\/::D|\/::O|\/::\(|\/::\+|\/:--b|\/::Q|\/::T|\/:,@P|\/:,@-D|\/::d|\/:,@o|\/::g|\/:\|-\)|\/::!|\/::L|\/::>|\/::,@|\/:,@f|\/::-S|\/:\?|\/:,@x|\/:,@@|\/::8|\/:,@!|\/:!!!|\/:xx|\/:bye|\/:wipe|\/:dig|\/:handclap|\/:&-\(|\/:B-\)|\/:<@|\/:@>|\/::-O|\/:>-\||\/:P-\(|\/::'\||\/:X-\)|\/::\*|\/:@x|\/:8\*|\/:pd|\/:<W>|\/:beer|\/:basketb|\/:oo|\/:coffee|\/:eat|\/:pig|\/:rose|\/:fade|\/:showlove|\/:heart|\/:break|\/:cake|\/:li|\/:bome|\/:kn|\/:footb|\/:ladybug|\/:shit|\/:moon|\/:sun|\/:gift|\/:hug|\/:strong|\/:weak|\/:share|\/:v|\/:@\)|\/:jj|\/:@@|\/:bad|\/:lvu|\/:no|\/:ok|\/:love|\/:<L>|\/:jump|\/:shake|\/:<O>|\/:circle|\/:kotow|\/:turn|\/:skip|\/:oY|\/:#-0|\/:hiphot|\/:kiss|\/:<&|\/:&>)(.*)$/;

module.exports = function(token, calendarUrl) {

  return wechat(token, wechat.text(textHandler));

  function textHandler(msg, req, res, next) {
    var content = msg.Content.trim();
    if (content === '日历') {
      res.reply([{
        title: '宝宝的成长日历',
        description: '点击查看',
        picurl: 'http://tickids.qiniudn.com/calendar-cover.jpg',
        url: calendarUrl + '?user=' + msg.FromUserName
      }]);
      return;
    }
    if (content === '取消') {
      Tick.findLatest(function(err, tick) {
        if (tick) {
          moment.lang('zh-cn');
          var tickTimeStr = moment(tick.ctime).format('LL');
          tick.remove(function() {
            res.reply('您取消了对宝宝 ' + tickTimeStr + ' 的表扬');
          });
        } else {
          res.reply('您还没有表扬过宝宝');
        }
      });
    }
    var match = g_contentReg.exec(content);
    if (!match) {
      res.reply('您需要先输入表情，然后输入备注，备注是可选的。例如：/::)宝宝把垃圾扔进垃圾桶了，或，/::)');
      return;
    }
    var tick = match[1];
    var comment = match[2].trim();
    var tick = new models.Tick({
      userOpenId: msg.FromUserName,
      ctime: new Date(),
      comment: comment,
      tick: tick
    });
    tick.save(function() {
      res.reply('您的宝宝表现很好');
    });
  }
}

