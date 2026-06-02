
import { DietPhase } from './diet-generator'

export async function generateDietPlanAI(formData: any): Promise<{ preOp: DietPhase | null, postOp: DietPhase | null }> {
  try {
    const prompt = `فرم ارزیابی تغذیه جراحی تکمیل شد
    
اطلاعات بیمار:
- سن: ${formData.age}
- جنسیت: ${formData.gender === 'male' ? 'مرد' : 'زن'}
- قد: ${formData.height} cm
- وزن: ${formData.weight} kg
- BMI: ${formData.bmi}

اطلاعات عمل:
- نوع عمل: ${formData.surgeryType}
- روش جراحی: ${formData.surgeryMethod}
- روزهای مانده تا عمل: ${formData.daysUntilSurgery}
- روزهای درخواستی بعد از عمل: ${formData.postOpDaysRequested}

سوابق پزشکی:
- بیماری‌ها: ${formData.underlyingDiseases}
- داروها: ${formData.currentMeds}
- مکمل‌ها: ${formData.supplements}
- حساسیت‌ها: ${formData.foodAllergies} (غذایی)، ${formData.medAllergies} (دارویی)
- مشکلات گوارشی: ${formData.digestiveIssues}
- سابقه کم‌خونی: ${formData.anemiaHistory}

سبک زندگی:
- فعالیت بدنی: ${formData.activityLevel}
- مصرف سیگار/الکل: ${formData.smokingAlcohol}
- وعده‌های غذایی: ${formData.mealFrequency}
- مصرف مایعات: ${formData.fluidIntake}
- مصرف پروتئین: ${formData.proteinIntake}

اطلاعات تکمیلی:
1. تغییرات وزن: ${formData.q1_weightChanges}
2. جویدن/بلع: ${formData.q2_chewingAbility}
3. اجابت مزاج: ${formData.q3_bowelHabits}
4. خواب: ${formData.q4_sleepQuality}
5. استرس: ${formData.q5_stressLevel}
6. آشپزی: ${formData.q6_cookingSupport}
7. بودجه: ${formData.q7_budget}
8. رژیم‌های قبلی: ${formData.q8_previousDiets}
9. تنفر غذایی: ${formData.q9_cravingsAversions}
10. جزئیات فعالیت: ${formData.q10_activityDetails}

هدف و تنظیمات:
- هدف: ${formData.mainGoal}
- تنوع: ${formData.dietVariety === 'different' ? 'متفاوت در هر روز' : 'تکراری و چرخشی'}

لطفاً خروجی را دقیقاً در فرمت JSON خواسته شده تولید کن.
نکته مهم: اگر بیمار روزهای قبل از عمل دارد، حتماً آنها را در ابتدای آرایه days با عنوان "روز X قبل از عمل" بیاور.`

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        userProfile: {
          firstName: 'بیمار',
          lastName: '',
          age: parseInt(formData.age) || 30,
          location: 'Iran',
          language: 'fa',
          role: 'doctor' // Use doctor role for more clinical analysis
        }
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate diet plan')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const parsed = JSON.parse(line)
            if (parsed.type === 'content') {
              fullContent += parsed.content
            }
          } catch (e) {
            // ignore incomplete JSON
          }
        }
      }
    }
    
    // Now extract JSON from fullContent
    const jsonMatch = fullContent.match(/```json_diet_plan\n([\s\S]*?)\n```/) || fullContent.match(/```json\n([\s\S]*?)\n```/)
    
    if (jsonMatch && jsonMatch[1]) {
      const parsedData = JSON.parse(jsonMatch[1])
      
      // Split into pre-op and post-op based on day title
      const preOpDays = parsedData.days.filter((d: any) => d.day.includes('قبل از عمل'))
      const postOpDays = parsedData.days.filter((d: any) => !d.day.includes('قبل از عمل'))
      
      return {
        preOp: preOpDays.length > 0 ? { ...parsedData, title: 'رژیم قبل از عمل', days: preOpDays } : null,
        postOp: postOpDays.length > 0 ? { ...parsedData, title: 'رژیم بعد از عمل', days: postOpDays } : null
      }
    }
    
    // If no markdown block, try to parse the whole string if it looks like JSON
    try {
      const parsedData = JSON.parse(fullContent)
      if (parsedData.days) {
        const preOpDays = parsedData.days.filter((d: any) => d.day.includes('قبل از عمل'))
        const postOpDays = parsedData.days.filter((d: any) => !d.day.includes('قبل از عمل'))
        return {
          preOp: preOpDays.length > 0 ? { ...parsedData, title: 'رژیم قبل از عمل', days: preOpDays } : null,
          postOp: postOpDays.length > 0 ? { ...parsedData, title: 'رژیم بعد از عمل', days: postOpDays } : null
        }
      }
    } catch (e) {}

    throw new Error('No valid JSON found in response')

  } catch (error) {
    console.error('Error generating diet:', error)
    throw error
  }
}
