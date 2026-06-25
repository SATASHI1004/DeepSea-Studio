/**
 * 深海工作室 — 委託表單自動回信 & 繪師通知
 *
 * 安裝方式：
 * 1. 開啟 Google Form → 右上角 ⋮ → 指令碼編輯器
 * 2. 把這份程式碼貼上，取代預設內容
 * 3. 執行一次 setupTrigger()（會要求授權）
 * 4. 完成！之後每次有人填表就會自動執行
 */

// ===== 設定區 =====
var CONFIG = {
  ARTIST_EMAIL: 'satashi891004@gmail.com',
  STUDIO_NAME: '深海工作室 DeepSea Studio',
  REPLY_DAYS: 3
};

// ===== 一鍵安裝觸發器 =====
function setupTrigger() {
  // 移除舊的觸發器（避免重複）
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // 建立新觸發器
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();
  Logger.log('觸發器已建立！');
}

// ===== 主函式：表單送出時執行 =====
function onFormSubmit(e) {
  var responses = e.response.getItemResponses();
  var data = {};

  // 抓取所有欄位
  for (var i = 0; i < responses.length; i++) {
    var title = responses[i].getItem().getTitle();
    var answer = responses[i].getResponse();
    data[title] = answer || '（未填寫）';
  }

  // 找出客戶 Email（第 2 題）
  var customerEmail = findField(data, ['email', 'Email', '信箱', 'mail']);
  if (!customerEmail) {
    Logger.log('找不到客戶 Email，跳過回信');
    notifyArtist(data, '⚠️ 找不到客戶 Email');
    return;
  }

  // 找出客戶暱稱（第 1 題）
  var customerName = findField(data, ['暱稱', '名稱', 'name', 'Name', 'Nickname']);

  // 找出委託類型（第 5 題）
  var commissionType = findField(data, ['類型', 'Type', '委託類型']);

  // 找出風格偏好（第 6 題）
  var stylePreference = findField(data, ['風格', 'Style', '偏好']);

  sendCustomerReply(customerEmail, customerName);
  notifyArtist(data, customerName);
}

// ===== 寄送客戶確認信 =====
function sendCustomerReply(email, name) {
  var displayName = name || '委託人';

  var subject = '【深海工作室】已收到您的委託表單 ✨';

  var body = displayName + ' 您好！\n\n'
    + '感謝您填寫深海工作室的委託表單 🐳\n\n'
    + '我們已收到您的委託需求，繪師將於 ' + CONFIG.REPLY_DAYS + ' 個工作天內確認並回覆報價。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '📌 注意事項：\n'
    + '• 繪師會透過您填寫的偏好聯絡方式與您聯繫\n'
    + '• 報價確認後才需要支付訂金（50%）\n'
    + '• 如有急件需求，請在回信中特別說明\n'
    + '━━━━━━━━━━━━━━━━━━━━\n\n'
    + '如有任何問題，歡迎直接回覆此信件。\n\n'
    + '✨ ' + CONFIG.STUDIO_NAME + '\n'
    + '🌐 https://SATASHI1004.github.io/DeepSea-Studio/\n';

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body,
    name: CONFIG.STUDIO_NAME,
    replyTo: CONFIG.ARTIST_EMAIL
  });

  Logger.log('已寄出確認信給：' + email);
}

// ===== 通知繪師 =====
function notifyArtist(data, customerName) {
  var subject = '📨 新委託！來自：' + (customerName || '未知');

  var body = '收到新的委託表單 🎉\n\n';

  // 列出所有填寫內容
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    body += '【' + keys[i] + '】\n' + data[keys[i]] + '\n\n';
  }

  body += '━━━━━━━━━━━━━━━━━━━━\n';
  body += '請盡快回覆客戶 💪\n';

  MailApp.sendEmail({
    to: CONFIG.ARTIST_EMAIL,
    subject: subject,
    body: body,
    name: CONFIG.STUDIO_NAME
  });

  Logger.log('已通知繪師');
}

// ===== 工具：模糊比對欄位名稱 =====
function findField(data, keywords) {
  var keys = Object.keys(data);
  for (var k = 0; k < keywords.length; k++) {
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf(keywords[k]) !== -1) {
        return data[keys[i]];
      }
    }
  }
  return null;
}
