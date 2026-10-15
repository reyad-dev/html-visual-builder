/**
 * Curated Pre-built Example Templates
 * Enables users to instantly preview, explore, and start with complete, high-fidelity responsive designs.
 */

export interface ExampleTemplate {
  id: string;
  title: string;
  titleAr: string;
  category: 'Landing Page' | 'Portfolio' | 'Business' | 'Starter';
  description: string;
  descriptionAr: string;
  thumbnailIcon: string;
  html: string;
  css?: string;
}

export const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: 'saas-landing',
    title: 'SaaS Product Landing Page',
    titleAr: 'صفحة هبوط تطبيق ومنتجات رقمية',
    category: 'Landing Page',
    description: 'High-converting modern landing page with hero, features grid, social proof, and call-to-action.',
    descriptionAr: 'صفحة هبوط تسويقية متكاملة تتضمن قسماً رئيسياً، بطاقات مميزات، وأزرار دعوة لاتخاذ إجراء.',
    thumbnailIcon: '🚀',
    html: `
<section class="builder-section" style="padding: 72px 24px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); font-family: 'Alexandria', 'Cairo', 'Inter', sans-serif;">
  <div class="builder-container" style="max-width: 1140px; margin: 0 auto; text-align: center; padding: 0 16px;">
    <div style="display: inline-block; padding: 6px 16px; background-color: rgba(14, 165, 233, 0.12); color: #0284c7; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 20px;">
      ✨ إصدار 2026 الجديد • Next-Gen Visual Builder
    </div>
    <h1 style="font-size: 2.75rem; font-weight: 800; color: #0f172a; margin: 0 0 20px 0; letter-spacing: -0.03em; line-height: 1.25;">
      صمم صفحات الويب باحترافية وسرعة فائقة
    </h1>
    <p style="font-size: 1.2rem; color: #475569; margin: 0 auto 36px auto; max-width: 680px; line-height: 1.75;">
      محرر مرئي متطور بالسحب والإفلات يتيح لك بناء واجهات مستخدم متجاوبة، وتصدير كود HTML/CSS نظيف ومستقل أو حفظه كـ PDF بنقرة واحدة.
    </p>
    <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px;">
      <a href="#" class="builder-btn" style="display: inline-block; padding: 14px 34px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.05rem; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);">
        ابدأ الآن مجاناً
      </a>
      <a href="#" class="builder-btn" style="display: inline-block; padding: 14px 30px; background-color: #f1f5f9; color: #334155; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.05rem; border: 1px solid #cbd5e1;">
        مشاهدة العرض التوضيحي
      </a>
    </div>

    <!-- Features Row -->
    <div style="display: flex; gap: 24px; flex-wrap: wrap; text-align: right; margin-top: 32px;" dir="rtl">
      <div style="flex: 1; min-width: 280px; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="font-size: 2rem; margin-bottom: 14px;">🎯</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">سحب وإفلات سلس</h3>
        <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0;">مكونات ذكية قابلة لإعادة الترتيب مع تحكم دقيق في الأبعاد، الهوامش، والأنماط.</p>
      </div>

      <div style="flex: 1; min-width: 280px; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="font-size: 2rem; margin-bottom: 14px;">⚡</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">تصدير HTML مستقل</h3>
        <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0;">كود HTML5 و CSS نظيف 100% بدون أي اعتمادات خارجية ثقيلة، جاهز للنشر فوراً.</p>
      </div>

      <div style="flex: 1; min-width: 280px; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="font-size: 2rem; margin-bottom: 14px;">🖨️</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">طباعة وحفظ كـ PDF</h3>
        <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0;">تصدير عالي الدقة يضمن مطابقة مخرجات الـ PDF لكل العناصر والخطوط العربية.</p>
      </div>
    </div>
  </div>
</section>
    `.trim(),
  },
  {
    id: 'personal-portfolio',
    title: 'Personal Portfolio & Bio',
    titleAr: 'معرض أعمال وسيرة ذاتية شخصية',
    category: 'Portfolio',
    description: 'Clean personal website showcase featuring bio, skills pills, project highlights, and contact actions.',
    descriptionAr: 'قالب سيرة ذاتية ومعرض أعمال عصري يدعم الخطوط العربية Alexandria و Cairo مع قائمة مهارات ومشاريع.',
    thumbnailIcon: '💼',
    html: `
<section class="builder-section" style="padding: 64px 24px; background-color: #ffffff; font-family: 'Alexandria', 'Cairo', 'Inter', sans-serif;">
  <div class="builder-container" style="max-width: 960px; margin: 0 auto; padding: 0 16px;">
    <!-- Profile Header -->
    <div style="display: flex; align-items: center; gap: 32px; flex-wrap: wrap; margin-bottom: 48px;">
      <div style="width: 110px; height: 110px; border-radius: 50%; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2.5rem; font-weight: 700; box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);">
        MR
      </div>
      <div style="flex: 1; min-width: 260px;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.02em;">
          محمد رياض — Mohamed Reyad
        </h1>
        <p style="font-size: 1.15rem; color: #0284c7; font-weight: 600; margin: 0 0 12px 0;">
          Full Stack Web Developer & UI/UX Architect
        </p>
        <p style="font-size: 1rem; color: #475569; line-height: 1.7; margin: 0;">
          شغوف ببناء تطبيقات الويب الحديثة وحلول الأتمتة المبتكرة، مع التركيز على تجربة المستخدم الفائقة والأداء العالي.
        </p>
      </div>
    </div>

    <!-- Skills Badges -->
    <div style="margin-bottom: 40px; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 16px 0;">المهارات والتقنيات الأساسية:</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <span style="padding: 6px 14px; background-color: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">React 19 & Next.js</span>
        <span style="padding: 6px 14px; background-color: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">TypeScript</span>
        <span style="padding: 6px 14px; background-color: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">HTML5 / Modern CSS</span>
        <span style="padding: 6px 14px; background-color: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">Visual Builders & GrapesJS</span>
        <span style="padding: 6px 14px; background-color: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">Node.js & APIs</span>
        <span style="padding: 6px 14px; background-color: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">SEO & Digital Performance</span>
      </div>
    </div>

    <!-- Portfolio Projects 2-col -->
    <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 20px 0;">نماذج الأعمال المختارة:</h2>
    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 280px; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <h4 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Visual HTML Page Builder</h4>
        <p style="font-size: 0.925rem; color: #64748b; line-height: 1.6; margin: 0 0 16px 0;">محرر مرئي تفاعلي لتصميم صفحات الويب وتصدير كود HTML أو مستندات PDF.</p>
        <a href="#" style="color: #0284c7; text-decoration: none; font-weight: 600; font-size: 0.9rem;">عرض التفاصيل &larr;</a>
      </div>

      <div style="flex: 1; min-width: 280px; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <h4 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Full-Stack Workflow Automation</h4>
        <p style="font-size: 0.925rem; color: #64748b; line-height: 1.6; margin: 0 0 16px 0;">منظومة متكاملة لربط واجهات الويب بأنظمة إدارة الأعمال وتدفقات العمل الذكية.</p>
        <a href="#" style="color: #0284c7; text-decoration: none; font-weight: 600; font-size: 0.9rem;">عرض التفاصيل &larr;</a>
      </div>
    </div>
  </div>
</section>
    `.trim(),
  },
  {
    id: 'business-agency',
    title: 'Business & Agency Showcase',
    titleAr: 'صفحة شركة وخدمات أعمال',
    category: 'Business',
    description: 'Corporate agency layout with services showcase, statistics grid, and contact banner.',
    descriptionAr: 'قالب تجاري لعرض خدمات الشركات والوكالات الرقمية مع مؤشرات أرقام وتواصل مباشر.',
    thumbnailIcon: '🏢',
    html: `
<section class="builder-section" style="padding: 68px 24px; background: #0f172a; color: #f8fafc; font-family: 'Alexandria', 'Cairo', 'Inter', sans-serif;">
  <div class="builder-container" style="max-width: 1140px; margin: 0 auto; text-align: center; padding: 0 16px;">
    <span style="display: inline-block; padding: 6px 18px; background: rgba(14, 165, 233, 0.2); color: #38bdf8; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px;">
      حلول رقمية متكاملة للشركات
    </span>
    <h1 style="font-size: 2.5rem; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; letter-spacing: -0.02em;">
      نبتكر حلولاً رقمية تدعم نمو أعمالك
    </h1>
    <p style="font-size: 1.125rem; color: #94a3b8; max-width: 650px; margin: 0 auto 48px auto; line-height: 1.7;">
      فريق من الخبراء في تصميم وتطوير المواقع والأنظمة السحابية لتقديم أفضل عائد استثماري لشركتك.
    </p>

    <!-- Metrics Row -->
    <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 48px;">
      <div style="flex: 1; min-width: 200px; padding: 24px; background: #1e293b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <h3 style="font-size: 2.25rem; font-weight: 800; color: #38bdf8; margin: 0 0 6px 0;">+150</h3>
        <p style="font-size: 0.95rem; color: #cbd5e1; margin: 0;">مشروع مكتمل بنجاح</p>
      </div>
      <div style="flex: 1; min-width: 200px; padding: 24px; background: #1e293b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <h3 style="font-size: 2.25rem; font-weight: 800; color: #38bdf8; margin: 0 0 6px 0;">99.8%</h3>
        <p style="font-size: 0.95rem; color: #cbd5e1; margin: 0;">نسبة رضا العملاء</p>
      </div>
      <div style="flex: 1; min-width: 200px; padding: 24px; background: #1e293b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <h3 style="font-size: 2.25rem; font-weight: 800; color: #38bdf8; margin: 0 0 6px 0;">24/7</h3>
        <p style="font-size: 0.95rem; color: #cbd5e1; margin: 0;">دعم فني واستشارات مستمرة</p>
      </div>
    </div>

    <a href="#" class="builder-btn" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);">
      تواصل معنا الآن
    </a>
  </div>
</section>
    `.trim(),
  },
  {
    id: 'starter-canvas',
    title: 'Starter Visual Canvas',
    titleAr: 'المثال الأساسي المنسق',
    category: 'Starter',
    description: 'Clean starter layout with section, heading, button, and responsive columns.',
    descriptionAr: 'قالب البداية السريعة المتناسق مع دعم الخطوط العربية والتوسيط المثالي.',
    thumbnailIcon: '🎨',
    html: `
<section class="builder-section" style="padding: 72px 28px; font-family: 'Alexandria', 'Cairo', 'Tajawal', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div class="builder-container" style="max-width: 960px; margin: 0 auto; text-align: center; padding: 0 16px;">
    <h1 style="font-size: 2.25rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em; line-height: 1.3;">
      محمد رياض — Start Designing
    </h1>
    <p style="font-size: 1.125rem; color: #475569; margin-top: 0; margin-bottom: 28px; line-height: 1.7; max-width: 640px; margin-left: auto; margin-right: auto;">
      اسحب العناصر من الشريط الجانبي لإضافة أقسام جديدة، نصوص، أزرار، وصور، أو اضغط على أي عنصر في لوحة التصميم لتعديل خصائصه مباشرة.
    </p>
    <a href="#" class="builder-btn" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 1rem; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);">
      Explore Components • استكشف المكونات
    </a>

    <div class="builder-row" style="display: flex; gap: 24px; flex-wrap: wrap; margin-top: 40px;">
      <div class="builder-col" style="flex: 1; min-width: 240px; padding: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; min-height: 100px;">
        <p style="margin: 0; color: #475569; font-weight: 500;">Column 1 — العمود الأول</p>
      </div>
      <div class="builder-col" style="flex: 1; min-width: 240px; padding: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; min-height: 100px;">
        <p style="margin: 0; color: #475569; font-weight: 500;">Column 2 — العمود الثاني</p>
      </div>
    </div>
  </div>
</section>
    `.trim(),
  },
];
