const { supabase, supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.supabase = supabase;
    this.admin = supabaseAdmin;
  }

  async findById(id) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      logger.error(`Error finding ${this.tableName} by id:`, error);
      return null;
    }
    return data;
  }

  async findOne(conditions) {
    let query = this.supabase.from(this.tableName).select('*');
    
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') {
      logger.error(`Error finding ${this.tableName}:`, error);
    }
    return data;
  }

  async findAll(conditions = {}) {
    let query = this.supabase.from(this.tableName).select('*');
    
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    
    if (error) {
      logger.error(`Error finding all ${this.tableName}:`, error);
      return [];
    }
    return data;
  }

  async create(data) {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
    return result;
  }

  async update(id, data) {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
    return result;
  }

  async delete(id) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      logger.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
    return true;
  }
}

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByLineId(lineUserId) {
    return this.findOne({ line_user_id: lineUserId });
  }

  async getCaregivers(userId) {
    const { data, error } = await this.supabase
      .from('caregivers')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      logger.error('Error getting caregivers:', error);
      return [];
    }
    return data;
  }

  async addCaregiver(userId, caregiverData) {
    const { data, error } = await this.supabase
      .from('caregivers')
      .insert({ user_id: userId, ...caregiverData })
      .select()
      .single();
    
    if (error) {
      logger.error('Error adding caregiver:', error);
      throw error;
    }
    return data;
  }
}

class ConversationLog extends BaseModel {
  constructor() {
    super('conversation_logs');
  }

  async getRecentConversations(userId, limit = 10) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      logger.error('Error getting recent conversations:', error);
      return [];
    }
    return data;
  }

  async getTodayConversations(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', today.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) {
      logger.error('Error getting today conversations:', error);
      return [];
    }
    return data;
  }
}

class MedicationLog extends BaseModel {
  constructor() {
    super('medication_logs');
  }

  async getTodayLogs(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*, medications(*)')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());
    
    if (error) {
      logger.error('Error getting today medication logs:', error);
      return [];
    }
    return data;
  }

  async getComplianceRate(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('scheduled_time, taken_at, skipped')
      .eq('user_id', userId)
      .gte('scheduled_time', startDate.toISOString());
    
    if (error) {
      logger.error('Error calculating compliance rate:', error);
      return 0;
    }
    
    if (!data || data.length === 0) return 100;
    
    const taken = data.filter(log => log.taken_at && !log.skipped).length;
    return Math.round((taken / data.length) * 100);
  }
}

class VitalsLog extends BaseModel {
  constructor() {
    super('vitals_logs');
  }

  async getLatestVitals(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      logger.error('Error getting latest vitals:', error);
    }
    return data;
  }

  async getVitalsTrend(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('measured_at', startDate.toISOString())
      .order('measured_at', { ascending: true });
    
    if (error) {
      logger.error('Error getting vitals trend:', error);
      return [];
    }
    return data;
  }

  async checkForAbnormalVitals(vitals) {
    const alerts = [];
    
    if (vitals.bp_systolic && vitals.bp_diastolic) {
      if (vitals.bp_systolic > 180 || vitals.bp_diastolic > 110) {
        alerts.push({ type: 'HIGH_BP', severity: 'critical', message: 'ความดันสูงมาก' });
      } else if (vitals.bp_systolic < 90 || vitals.bp_diastolic < 60) {
        alerts.push({ type: 'LOW_BP', severity: 'high', message: 'ความดันต่ำ' });
      }
    }
    
    if (vitals.glucose) {
      if (vitals.glucose > 300) {
        alerts.push({ type: 'HIGH_GLUCOSE', severity: 'critical', message: 'น้ำตาลสูงมาก' });
      } else if (vitals.glucose < 70) {
        alerts.push({ type: 'LOW_GLUCOSE', severity: 'high', message: 'น้ำตาลต่ำ' });
      }
    }
    
    if (vitals.heart_rate) {
      if (vitals.heart_rate > 120) {
        alerts.push({ type: 'HIGH_HR', severity: 'warning', message: 'หัวใจเต้นเร็ว' });
      } else if (vitals.heart_rate < 50) {
        alerts.push({ type: 'LOW_HR', severity: 'warning', message: 'หัวใจเต้นช้า' });
      }
    }
    
    return alerts;
  }
}

class MoodLog extends BaseModel {
  constructor() {
    super('mood_logs');
  }

  async getTodayMood(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', today.toISOString())
      .order('timestamp', { ascending: false });
    
    if (error) {
      logger.error('Error getting today mood:', error);
      return [];
    }
    return data;
  }

  async getMoodTrend(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('mood, mood_score, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) {
      logger.error('Error getting mood trend:', error);
      return [];
    }
    return data;
  }

  async checkMoodPattern(userId) {
    const recentMoods = await this.getMoodTrend(userId, 3);
    
    if (recentMoods.length < 3) return null;
    
    const allSad = recentMoods.every(m => m.mood === 'sad' || m.mood_score <= 2);
    
    if (allSad) {
      return {
        type: 'PERSISTENT_LOW_MOOD',
        severity: 'high',
        message: 'อารมณ์ซึมเศร้าต่อเนื่อง 3 วัน'
      };
    }
    
    return null;
  }
}

class DailyReport extends BaseModel {
  constructor() {
    super('daily_reports');
  }

  async getTodayReport(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    return this.findOne({
      user_id: userId,
      report_date: today
    });
  }

  async getRecentReports(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('report_date', startDate.toISOString().split('T')[0])
      .order('report_date', { ascending: false });
    
    if (error) {
      logger.error('Error getting recent reports:', error);
      return [];
    }
    return data;
  }
}

class Schedule extends BaseModel {
  constructor() {
    super('schedules');
  }

  async getDueSchedules() {
    const now = new Date().toISOString();
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*, users(*)')
      .eq('active', true)
      .lte('next_send_at', now);
    
    if (error) {
      logger.error('Error getting due schedules:', error);
      return [];
    }
    return data;
  }

  async updateNextSendTime(id) {
    const schedule = await this.findById(id);
    if (!schedule) return;
    
    const nextTime = this.calculateNextSendTime(schedule);
    
    return this.update(id, { next_send_at: nextTime });
  }

  calculateNextSendTime(schedule) {
    const now = new Date();
    const [hours, minutes] = schedule.time_of_day.split(':');
    const nextTime = new Date();
    
    nextTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    
    while (!schedule.days_of_week.includes(dayNames[nextTime.getDay()])) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    return nextTime.toISOString();
  }
}

class AlertLog extends BaseModel {
  constructor() {
    super('alert_logs');
  }

  async getUnresolvedAlerts(userId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('resolved', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error('Error getting unresolved alerts:', error);
      return [];
    }
    return data;
  }

  async resolveAlert(id) {
    return this.update(id, {
      resolved: true,
      resolved_at: new Date().toISOString()
    });
  }
}

module.exports = {
  User: new User(),
  ConversationLog: new ConversationLog(),
  MedicationLog: new MedicationLog(),
  VitalsLog: new VitalsLog(),
  MoodLog: new MoodLog(),
  DailyReport: new DailyReport(),
  Schedule: new Schedule(),
  AlertLog: new AlertLog()
};