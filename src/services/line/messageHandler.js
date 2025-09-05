const { Client } = require('@line/bot-sdk');
const { User, ConversationLog, MoodLog } = require('../../models');
const aiService = require('../ai/chatService');
const reportService = require('../reports/dailyReport');
const healthService = require('../health/healthTracker');
const logger = require('../../utils/logger');
const { detectIntent } = require('../../utils/intentDetector');
const { quickReplyTemplates } = require('./templates/quickReply');
const { flexTemplates } = require('./templates/flexMessages');

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
});

class MessageHandler {
  async handleEvent(event) {
    const { type, source, message, replyToken, postback } = event;
    const userId = source.userId;
    
    try {
      let user = await User.findOne({ where: { lineUserId: userId } });
      
      if (!user) {
        user = await this.registerNewUser(userId);
        await this.sendWelcomeMessage(replyToken, user);
        return;
      }
      
      if (type === 'message' && message.type === 'text') {
        await this.handleTextMessage(user, message.text, replyToken);
      } else if (type === 'postback') {
        await this.handlePostback(user, postback, replyToken);
      }
      
      await this.logConversation(user.id, 'user', message?.text || postback?.data);
      
    } catch (error) {
      logger.error('Error in handleEvent:', error);
      await this.sendErrorMessage(replyToken);
    }
  }
  
  async handleTextMessage(user, text, replyToken) {
    const intent = detectIntent(text);
    
    switch (intent.type) {
      case 'MEDICATION_TAKEN':
        await this.handleMedicationLog(user, intent.data, replyToken);
        break;
        
      case 'VITALS_REPORT':
        await this.handleVitalsLog(user, text, replyToken);
        break;
        
      case 'MOOD_CHECK':
        await this.handleMoodCheck(user, intent.data, replyToken);
        break;
        
      case 'REQUEST_REPORT':
        await this.sendTodayReport(user, replyToken);
        break;
        
      case 'EMERGENCY':
        await this.handleEmergency(user, text, replyToken);
        break;
        
      default:
        await this.handleGeneralChat(user, text, replyToken);
    }
  }
  
  async handleGeneralChat(user, text, replyToken) {
    const response = await aiService.generateResponse(user, text);
    
    await this.logConversation(user.id, 'user', text);
    await this.logConversation(user.id, 'assistant', response);
    
    const checkForRedFlags = this.checkRedFlags(text, response);
    if (checkForRedFlags) {
      await this.triggerAlert(user, checkForRedFlags);
    }
    
    await client.replyMessage(replyToken, {
      type: 'text',
      text: response,
      quickReply: quickReplyTemplates.defaultOptions()
    });
  }
  
  async handleMedicationLog(user, medicationData, replyToken) {
    await healthService.logMedication(user.id, medicationData);
    
    const response = 'บันทึกการทานยาเรียบร้อยค่ะ 💊 เก่งมากที่ทานยาตรงเวลา!';
    
    await client.replyMessage(replyToken, {
      type: 'text',
      text: response,
      quickReply: quickReplyTemplates.afterMedication()
    });
  }
  
  async handleVitalsLog(user, text, replyToken) {
    const vitals = healthService.parseVitals(text);
    
    if (!vitals) {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: 'ขอโทษค่ะ ไม่เข้าใจค่าที่แจ้งมา กรุณาพิมพ์ใหม่ เช่น "ความดัน 120/80" หรือ "น้ำตาล 110"'
      });
      return;
    }
    
    const result = await healthService.logVitals(user.id, vitals);
    
    if (result.alert) {
      await this.triggerAlert(user, result.alert);
    }
    
    await client.replyMessage(replyToken, [
      {
        type: 'text',
        text: result.message
      },
      flexTemplates.vitalsChart(result.recentData)
    ]);
  }
  
  async handleMoodCheck(user, mood, replyToken) {
    await MoodLog.create({
      userId: user.id,
      mood: mood.emoji,
      note: mood.text
    });
    
    const response = aiService.generateMoodResponse(mood);
    
    await client.replyMessage(replyToken, {
      type: 'text',
      text: response,
      quickReply: quickReplyTemplates.moodFollowUp()
    });
  }
  
  async sendWelcomeMessage(replyToken, user) {
    const messages = [
      {
        type: 'text',
        text: `สวัสดีค่ะ! ดิฉันคือ Health Buddy 🌟\nผู้ช่วยดูแลสุขภาพส่วนตัวของคุณ\n\nฉันจะคอย:\n✅ เตือนทานยา\n✅ เตือนวัดความดัน\n✅ คุยเป็นเพื่อน\n✅ ส่งรายงานให้ลูกหลาน\n\nเริ่มต้นง่ายๆ เพียงแค่กด "ตั้งค่า" ด้านล่างค่ะ`
      },
      flexTemplates.welcomeCard(user)
    ];
    
    await client.replyMessage(replyToken, messages);
  }
  
  async handleEmergency(user, text, replyToken) {
    await this.triggerAlert(user, {
      level: 'CRITICAL',
      message: `Emergency keyword detected: ${text}`,
      action: 'IMMEDIATE_FAMILY_NOTIFICATION'
    });
    
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '⚠️ ได้แจ้งเตือนให้ครอบครัวแล้วค่ะ\nกรุณารอสักครู่ จะมีคนติดต่อกลับ\n\nหากฉุกเฉินมาก โทร 1669 ได้เลยค่ะ'
    });
  }
  
  async sendTodayReport(user, replyToken) {
    const report = await reportService.generateDailyReport(user.id);
    
    await client.replyMessage(replyToken, [
      {
        type: 'text',
        text: 'นี่คือสรุปวันนี้ของคุณค่ะ 📊'
      },
      report.flexMessage
    ]);
  }
  
  async handlePostback(user, postback, replyToken) {
    const data = JSON.parse(postback.data);
    
    switch (data.action) {
      case 'SET_REMINDER':
        await this.handleSetReminder(user, data, replyToken);
        break;
      case 'VIEW_HISTORY':
        await this.handleViewHistory(user, data, replyToken);
        break;
      case 'CHANGE_PERSONA':
        await this.handleChangePersona(user, data, replyToken);
        break;
    }
  }
  
  async registerNewUser(lineUserId) {
    const profile = await client.getProfile(lineUserId);
    
    return await User.create({
      lineUserId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      language: profile.language || 'th',
      persona: 'friendly',
      timezone: 'Asia/Bangkok',
      optIn: true
    });
  }
  
  async logConversation(userId, role, text) {
    await ConversationLog.create({
      userId,
      role,
      text,
      timestamp: new Date()
    });
  }
  
  checkRedFlags(userText, aiResponse) {
    const dangerKeywords = ['เจ็บ', 'หายใจไม่ออก', 'ล้ม', 'ช่วย', 'หัวใจ', 'แน่นหน้าอก'];
    const foundKeyword = dangerKeywords.find(keyword => 
      userText.includes(keyword) || aiResponse.includes(keyword)
    );
    
    if (foundKeyword) {
      return {
        level: 'HIGH',
        message: `Danger keyword detected: ${foundKeyword}`,
        action: 'NOTIFY_FAMILY'
      };
    }
    
    return null;
  }
  
  async triggerAlert(user, alert) {
    logger.warn('Alert triggered:', { userId: user.id, alert });
    
    const caregivers = await user.getCaregivers();
    
    for (const caregiver of caregivers) {
      await client.pushMessage(caregiver.lineUserId, {
        type: 'text',
        text: `⚠️ แจ้งเตือน!\n\n${user.displayName} ต้องการความช่วยเหลือ\n${alert.message}\n\nกรุณาติดต่อกลับด่วน`
      });
    }
  }
  
  async sendErrorMessage(replyToken) {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: 'ขอโทษค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    });
  }
}

module.exports = new MessageHandler();