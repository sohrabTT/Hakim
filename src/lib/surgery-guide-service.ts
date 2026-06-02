
export async function generateSurgeryGuideAI(patientData: any, surgeryType: string): Promise<{ preOp: string[], postOp: string[] }> {
  const prompt = `شما یک دستیار هوشمند پزشکی هستید. بر اساس اطلاعات بیمار و نوع عمل جراحی زیر، یک راهنمای جامع شامل چک‌لیست قبل از عمل و مراقبت‌های بعد از عمل تهیه کنید.
  
  اطلاعات بیمار:
  - نام: ${patientData.fullName}
  - سن: ${patientData.age}
  - جنسیت: ${patientData.gender === 'male' ? 'مرد' : 'زن'}
  - بیماری‌های زمینه‌ای: ${patientData.medicalHistory.underlyingDiseases.join(', ') || 'ندارد'}
  - سوابق جراحی: ${patientData.medicalHistory.previousSurgeries || 'ندارد'}
  - داروها: ${patientData.medications.currentMedications || 'ندارد'}
  - مکمل‌ها: ${patientData.medications.supplements || 'ندارد'}
  - حساسیت‌های دارویی: ${patientData.allergies.drugAllergies || 'ندارد'}
  - حساسیت‌های غذایی: ${patientData.allergies.foodAllergies || 'ندارد'}
  - BMI: ${patientData.vitalSigns.bmi}
  
  نوع عمل جراحی: ${surgeryType}
  
  لطفاً خروجی را دقیقاً در قالب JSON زیر ارائه دهید:
  {
    "preOp": ["آیتم ۱", "آیتم ۲", ...],
    "postOp": ["آیتم ۱", "آیتم ۲", ...]
  }
  
  نکات برای خروجی:
  - چک‌لیست قبل از عمل شامل: آزمایش‌های لازم، زمان ناشتا بودن، قطع یا ادامه داروها، و موارد احتیاطی بر اساس بیماری‌های زمینه‌ای بیمار باشد.
  - چک‌لیست مراقبت‌های بعد از عمل شامل: نحوه تعویض پانسمان، علائم خطر (که باید به پزشک اطلاع داده شود)، فعالیت‌های مجاز و غیرمجاز، و نکات تغذیه‌ای اولیه باشد.
  - موارد باید دقیق و متناسب با وضعیت خاص این بیمار (مثلاً دیابت یا فشار خون) باشد.
  - فقط و فقط JSON برگردانید.`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        userProfile: {
          firstName: patientData.fullName,
          lastName: '',
          age: patientData.age,
          location: 'Iran',
          language: 'fa'
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate surgery guide');
    }

    // Handle streaming response to extract the content
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let resultText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultText += decoder.decode(value, { stream: true });
      }
    }

    // Parse the stream of JSON objects (one per line) from /api/chat
    let fullContent = '';
    const lines = resultText.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === 'content' && parsed.content) {
          fullContent += parsed.content;
        }
      } catch (e) {
        // Skip invalid JSON lines (likely incomplete chunks)
      }
    }

    // The fullContent contains the actual AI response.
    // We need to find the JSON part.
    // Support multiple markdown block types and even bare JSON
    const jsonMatch = fullContent.match(/```(?:json|json_diet_plan)\n([\s\S]*?)\n```/) || 
                     fullContent.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    } else {
      console.error('AI response without JSON:', fullContent);
      throw new Error('Could not find JSON in AI response');
    }

  } catch (error) {
    console.error('Error generating surgery guide:', error);
    throw error;
  }
}
