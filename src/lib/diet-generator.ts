
import { addDays, format } from 'date-fns-jalali'

export interface DietDay {
  day: string
  meals: {
    name: string
    time: string
    content: string
  }[]
  notes?: string
}

export interface DietPhase {
  title: string
  description: string
  days: DietDay[]
  generalNotes?: string
}

export function generateMockDietPlan(formData: any): { preOp: DietPhase | null, postOp: DietPhase | null } {
  const daysUntil = parseInt(formData.daysUntilSurgery) || 0
  const daysPost = parseInt(formData.postOpDaysRequested) || 14
  
  // Pre-op Diet Generation
  let preOpPlan: DietPhase | null = null
  if (daysUntil > 0) {
    const preOpDays: DietDay[] = []
    for (let i = 1; i <= daysUntil; i++) {
      const isCloseToSurgery = daysUntil - i < 2
      preOpDays.push({
        day: `روز ${i} (قبل از عمل)`,
        meals: [
          { name: 'صبحانه', time: '8:00', content: isCloseToSurgery ? 'یک لیوان آب سیب شفاف + مکمل پروتئین' : 'تخم مرغ آب‌پز + نان تست سبوس‌دار' },
          { name: 'میان‌وعده صبح', time: '10:30', content: isCloseToSurgery ? 'آب‌میوه شفاف' : 'یک عدد سیب' },
          { name: 'ناهار', time: '13:30', content: isCloseToSurgery ? 'آب گوشت صاف شده (بدون چربی)' : 'سینه مرغ گریل شده + سالاد کاهو' },
          { name: 'میان‌وعده عصر', time: '16:30', content: isCloseToSurgery ? 'ژله رژیمی' : 'ماست کم‌چرب + خیار' },
          { name: 'شام', time: '20:00', content: isCloseToSurgery ? 'سوپ رقیق صاف شده' : 'ماهی بخارپز + سبزیجات بخارپز' },
        ],
        notes: isCloseToSurgery ? 'رژیم مایعات شفاف بسیار مهم است.' : 'مصرف پروتئین را افزایش دهید.'
      })
    }
    preOpPlan = {
      title: 'رژیم غذایی قبل از عمل',
      description: `برنامه غذایی برای ${daysUntil} روز باقی‌مانده تا جراحی جهت آمادگی کبد و بدن.`,
      days: preOpDays,
      generalNotes: 'مصرف مایعات را جدی بگیرید.'
    }
  }

  // Post-op Diet Generation
  const postOpDays: DietDay[] = []
  for (let i = 1; i <= daysPost; i++) {
    let phase = ''
    let meals = []
    
    if (i <= 2) {
      phase = 'مایعات شفاف'
      meals = [
        { name: 'صبحانه', time: '8:00', content: 'آب ولرم + عسل رقیق' },
        { name: 'ناهار', time: '13:00', content: 'آب مرغ صاف شده' },
        { name: 'شام', time: '19:00', content: 'آب گوشت صاف شده' },
      ]
    } else if (i <= 7) {
      phase = 'مایعات کامل'
      meals = [
        { name: 'صبحانه', time: '8:00', content: 'شیر کم‌چرب + پودر پروتئین' },
        { name: 'ناهار', time: '13:00', content: 'سوپ میکس شده رقیق' },
        { name: 'شام', time: '19:00', content: 'ماست رقیق شده' },
      ]
    } else {
      phase = 'پوره جات'
      meals = [
        { name: 'صبحانه', time: '8:00', content: 'پوره تخم مرغ نرم' },
        { name: 'ناهار', time: '13:00', content: 'پوره مرغ و هویج' },
        { name: 'شام', time: '19:00', content: 'سوپ غلیظ' },
      ]
    }

    postOpDays.push({
      day: `روز ${i} (بعد از عمل) - فاز ${phase}`,
      meals: meals,
      notes: `در این مرحله (${phase}) بسیار آهسته غذا بخورید.`
    })
  }

  const postOpPlan: DietPhase = {
    title: 'رژیم غذایی بعد از عمل',
    description: `برنامه غذایی ${daysPost} روزه ریکاوری بعد از جراحی.`,
    days: postOpDays,
    generalNotes: 'در صورت تهوع، مصرف غذا را متوقف کنید.'
  }

  return { preOp: preOpPlan, postOp: postOpPlan }
}
