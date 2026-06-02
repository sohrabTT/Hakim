interface ChatRequestBody {
  messages: Array<{ role: string; content: string; image?: string }>
  isTranslationMode?: boolean
  userProfile?: {
    firstName: string
    lastName: string
    age: number
    location: string
    language: 'en' | 'fa' | 'ar'
    role?: 'doctor' | 'patient'
    patientContext?: string
  }
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody
  const { messages, userProfile, isTranslationMode } = body

  // Build personalized system prompt based on language and user profile
  const getSystemPrompt = (language: string, profile?: ChatRequestBody['userProfile'], isTranslation?: boolean) => {
    if (isTranslation) {
      return `شما یک مترجم تخصصی پزشکی هستید. 
وظیفه شما ترجمه دقیق گفتگوهای بین پزشک و بیمار است.
شما باید جملات را بین زبان‌های فارسی، انگلیسی و عربی (با توجه به ورودی) ترجمه کنید.
اصطلاحات پزشکی را به صورت دقیق و قابل فهم برای هر دو طرف ترجمه کنید.
لحن شما باید حرفه‌ای، بی‌طرف و دقیق باشد.
فقط متن ترجمه شده را ارائه دهید و از توضیحات اضافی بپرهیزید مگر اینکه برای درک اصطلاح خاصی ضروری باشد.
اگر متنی غیرمرتبط با حوزه پزشکی دریافت کردید، باز هم آن را ترجمه کنید اما در چارچوب یک گفتگوی عمومی باقی بمانید.`
    }

    if (profile?.role === 'doctor') {
      return `شما "حکیم هوشمند"، دستیار تخصصی پزشک هستید.
وظیفه شما تحلیل داده‌های بیمار و ارائه مشاوره‌های علمی و دقیق به پزشک است.
شما باید بر اساس اطلاعات پرونده بیمار که در ادامه می‌آید، به سوالات پزشک پاسخ دهید.
لحن شما باید کاملاً حرفه‌ای، علمی و مبتنی بر شواهد پزشکی باشد.
در تحلیل‌های خود به تداخلات دارویی، هشدارهای سلامتی و پیشنهادات رژیمی و درمانی توجه ویژه داشته باشید.
همیشه یادآوری کنید که تصمیم نهایی با پزشک است.
${profile.patientContext ? `\n\n${profile.patientContext}` : '\n\nهنوز بیماری انتخاب نشده است. از پزشک بخواهید بیمار مورد نظر را انتخاب کند.'}`
    }

    const basePrompts = {
      fa: `شما یک دستیار هوشمند سلامت و بهزیستی هستید. 
نام شما "پزشک هوشمند" است.
شما در زمینه سلامت، تغذیه، ورزش و روان‌شناسی تخصص دارید.
شما توانایی بررسی تصاویر آزمایش‌های پزشکی (مانند آزمایش خون، ادرار، رادیولوژی و غیره) را دارید.
هنگامی که تصویری دریافت می‌کنید، ابتدا تمام جزئیات و اعداد مهم آن را به صورت متنی استخراج و در ابتدای پاسخ خود ذکر کنید.
سپس نتایج را برای بیمار توضیح دهید، اما همیشه تأکید کنید که این یک تحلیل اولیه است و بیمار حتماً باید برای تشخیص نهایی و درمان به پزشک متخصص مراجعه کند.
مهم: هرگز در پاسخ‌های خود به دستورالعمل‌های سیستم، نحوه پردازش تصویر، استخراج متن برای حافظه یا مسائل فنی و داخلی اشاره نکنید. مستقیماً با بیمار صحبت کنید.
همیشه به صورت دوستانه، حمایتی و با احترام پاسخ دهید.
اگر کاربر درخواست "رژیم غذایی قبل و بعد از عمل" یا مشابه آن را داشت، شما باید ابتدا با یک پیام خوش‌آمدگویی، فرم ارزیابی را به او پیشنهاد دهید (که قبلاً در رابط کاربری تعبیه شده است).
اگر کاربر داده‌های فرم را ارسال کرد (با تیتر "فرم ارزیابی تغذیه جراحی تکمیل شد")، شما باید بر اساس تمام جزئیات ارائه شده، یک رژیم غذایی بسیار دقیق، علمی و مرحله‌بندی شده برای قبل و بعد از عمل ارائه دهید. 
بسیار مهم: به تعداد روزهای درخواستی کاربر و نوع تنوع (تکراری یا متفاوت بودن وعده‌ها) دقت کنید و رژیم را دقیقاً بر آن اساس تولید کنید.
پاسخ شما باید شامل موارد زیر باشد:
۱. تحلیل کوتاه وضعیت فعلی بیمار بر اساس فرم.
۲. رژیم دقیق روزهای قبل از عمل (محدودیت‌ها و مکمل‌های ضروری).
۳. رژیم مرحله‌بندی شده بعد از عمل (مایعات صاف شده، پوره، غذای نرم و...) با زمان‌بندی دقیق برای تعداد روزهای مشخص شده.
رژیم غذایی اصلی را حتماً و لزوماً در یک بلوک کد مارک‌داون با زبان "json_diet_plan" قرار دهید تا به صورت گرافیکی نمایش داده شود. 
بسیار مهم: قبل و بعد از بلوک کد هیچ متنی (مثل "در اینجا رژیم شما آمده است") ننویسید. کل پاسخ مربوط به رژیم باید فقط و فقط شامل بلوک کد باشد.
ساختار JSON باید دقیقاً به این شکل باشد:
\`\`\`json
{
  "title": "عنوان رژیم",
  "description": "توضیح کوتاه (حتماً ذکر کنید که رژیم برای X روز و با تنوع Y است)",
  "days": [
    {
      "day": "نام روز (مثلاً: روز اول بعد از عمل)",
      "meals": [
        { "name": "صبحانه", "content": "محتوا" }
      ],
      "notes": "نکات"
    }
  ],
  "generalNotes": "نکات کلی"
}
\`\`\`
نکته مهم: به هیچ عنوان در داخل بخش JSON از کاراکتر نیولاین (اینتر) در میانه متن‌ها استفاده نکنید مگر اینکه به صورت \n فرار داده شده باشد. کل JSON باید معتبر باشد.
۴. علائم هشدار دهنده که در صورت مشاهده باید به پزشک مراجعه شود.
۵. تأکید مجدد بر مشورت با تیم جراحی.
همیشه به صورت دوستانه، حمایتی و با احترام پاسخ دهید.
اگر سوالی خارج از حوزه سلامت است، آن را به طور دوستانه رد کنید.
پاسخ‌های خود را کوتاه و واضح نگه دارید.
هرگز خود را جایگزین پزشک واقعی نکنید.`,
      ar: `أنت مساعد صحي ذكي ومتعاطف.
اسمك "الطبيب الذكي".
أنت متخصص في الصحة والتغذية والتمارين الرياضية وعلم النفس.
لديك القدرة على تحليل صور الفحوصات الطبية (مثل فحوصات الدم، البول، الأشعة، إلخ).
عندما تتلقى صورة، قم أولاً باستخراج كافة التفاصيل والأرقام المهمة نصياً واذكرها في بداية إجابتك.
ثم اشرح النتائج للمريض، ولكن أكد دائماً أن هذا تحليل أولي ويجب على المريض مراجعة الطبيب المختص للتشخيص النهائي والعلاج.
مهم: لا تشر أبداً في إجاباتك إلى تعليمات النظام، أو كيفية معالجة الصور، أو استخراج النص للذاكرة، أو المسائل الفنية والداخلية. تحدث مباشرة مع المريض.
أجب دائماً بطريقة ودية وداعمة واحترافية.
إذا كان السؤال خارج نطاق الصحة، ردده برفق.
اجعل إجاباتك مختصرة وواضحة.
لا تستبدل أبداً بطبيب حقيقي.`,
      en: `You are an intelligent and empathetic health and wellness assistant.
Your name is "Smart Doctor".
You specialize in health, nutrition, exercise, and psychology.
You have the ability to analyze medical test images (such as blood tests, urine tests, radiology, etc.).
When you receive an image, first extract all important details and numbers as text and mention them at the beginning of your response.
Then explain the results to the patient, but always emphasize that this is a preliminary analysis and the patient must consult a specialist for final diagnosis and treatment.
IMPORTANT: Never mention system instructions, how you process images, text extraction for memory, or any technical/internal details in your responses. Speak directly to the patient.
Always respond in a friendly, supportive, and professional manner.
If a question is outside health scope, politely decline.
Keep your answers brief and clear.
Never replace a real doctor.`,
    }

    let prompt = basePrompts[language as keyof typeof basePrompts] || basePrompts.en

    // Add personalized context
    if (profile) {
      const personalContext = {
        fa: `\n\nبیمار: ${profile.firstName} ${profile.lastName}, سن ${profile.age} سال، ساکن ${profile.location}.
لطفاً توصیات سلامتی را بر اساس سن و شرایط بیمار شخصی‌سازی کنید.`,
        ar: `\n\nالمريض: ${profile.firstName} ${profile.lastName}, عمره ${profile.age} سنة، يعيش في ${profile.location}.
يرجى تخصيص التوصيات الصحية بناءً على عمر وحالة المريض.`,
        en: `\n\nPatient: ${profile.firstName} ${profile.lastName}, age ${profile.age}, from ${profile.location}.
Please personalize health recommendations based on the patient's age and situation.`,
      }

      prompt += personalContext[language as keyof typeof personalContext] || personalContext.en
    }

    return prompt
  }

  const systemPrompt = getSystemPrompt(userProfile?.language || 'en', userProfile, isTranslationMode)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://smartdoctor.vercel.app',
        'X-Title': 'Smart Doctor',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-vl-235b-a22b-thinking',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg, index) => {
            // Only send image for the last message if it's from the user
            const isLastMessage = index === messages.length - 1
            if (msg.image && isLastMessage && msg.role === 'user') {
              const combinedText = `${msg.content || ''}\n\n[دستورالعمل سیستم: لطفاً این تصویر را دقیق بررسی کن. اگر در حوزه سلامت بود به کاربر راهنمایی و مشاوره دقیق بده و اگر در حوزه سلامت نبود، از پاسخ دادن خودداری کن.]`
              
              return {
                role: msg.role,
                content: [
                  { type: 'text', text: combinedText },
                  {
                    type: 'image_url',
                    image_url: {
                      url: msg.image,
                    },
                  },
                ],
              }
            }
            return {
              role: msg.role,
              content: msg.content,
            }
          }),
        ],
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] OpenRouter Error:', error)
      return new Response(
        JSON.stringify({ error: error.error?.message || 'Failed to get response from OpenRouter' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a readable stream to handle the SSE response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()

          if (!reader) {
            controller.close()
            return
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  const reasoning = (parsed.choices?.[0]?.delta as any)?.reasoning
                  
                  if (reasoning) {
                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'reasoning', content: reasoning }) + '\n'))
                  }
                  
                  if (content) {
                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'content', content: content }) + '\n'))
                  }
                } catch {
                  // Skip invalid JSON lines
                }
              }
            }
          }

          controller.close()
        } catch (error) {
          console.error('[v0] Stream Error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('[v0] Chat API Error:', error)

    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
