# 🔗 دليل خطافات الويب والتكامل الخارجي (WorkPress Webhooks & Integrations Guide)
## Outbound Webhooks Pipeline, HMAC-SHA256 Signatures, Discord, Slack, Teams & Zapier Connectors

> **نوع الوثيقة:** الدليل التشغيلي والتكاملي لربط WorkPress بقنوات التواصل والأتمتة الخارجية  
> **الإصدار المعتمد:** WorkPress v2.2.1-Stable  
> **المرجع الحاكم:** [WEBHOOKS_AND_INTEGRATIONS_ARCHITECTURE.md](../core/WEBHOOKS_AND_INTEGRATIONS_ARCHITECTURE.md)

---

## 🧭 1. الفلسفة ونموذج العمل (Outbound Webhooks Architecture)

يوفر محرك خطافات الويب الصادرة في WorkPress إمكانية بث أحداث العمليات والمشاريع الحية إلى المنصات السحابية والأنظمة الخارجية لحظة وقوعها، مع توفير:
1. **التوقيع الأمني المشفر (Cryptographic HMAC-SHA256):** ختم كل حمولة مرسلة بمفتاح سري للتأكد من موثوقية المصدر.
2. **قوالب مسبقة التهيأة (Native Connectors):** دعم تحويل الحمولات تلقائياً إلى صيغة متوافقة مع بطاقات Discord و Slack و Microsoft Teams دون وسيط.
3. **الحمولة القياسية العامة (Generic JSON Payload):** متوافقة 100% مع Make.com و Zapier و n8n و Postman.

---

## 📡 2. قائمة الأحداث القابلة للبث (Webhook Events Matrix)

| مفتاح الحدث (Event Key) | متى يتم إطلاقه؟ | نموذج البيانات المرفقة |
| :--- | :--- | :--- |
| `task.created` | عند إضافة مهمة جديدة في الكانبان | عنوان المهمة، المشروع، الأولوية، والكاتب |
| `task.status_changed` | عند نقل المهمة بين أعمدة الكانبان | الحالة القديمة، الحالة الجديدة، والمستخدم |
| `task.completed` | عند اكتمال المهمة رسمياً | تفاصيل المهمة، الحل المعتمد، ووقت الإنجاز |
| `contribution.created` | عند إيداع مساهمة أو دليل جديد | محتوى المساهمة، نوعها، وعدد المرفقات |
| `contribution.accepted` | عند اعتماد حل رسمي وتحديث المعرفة | رابط الحل، المهمة، وقائد المشروع المعتمد |
| `project.request_submitted` | عند تقديم العميل لطلب مشروع جديد | اسم المشروع، المواصفات الفنية، والميزانية |
| `project.completed` | عند اكتمال 100% من مهام المشروع | اسم المشروع، عدد المهام، ونسبة الإنجاز |
| `project.signed_off` | عند توقيع العميل الرقمي واستلام المشروع | بصمة SHA-256، ملاحظات العميل، والختم الزمني |

---

## 🔐 3. التوقيع الأمني والتحقق (HMAC-SHA256 Signature Verification)

ترسل المنظومة الترويسة الأمنية التالية في كل طلب Webhook:

```http
X-WorkPress-Signature: sha256=[COMPUTED_HMAC_HASH]
X-WorkPress-Event: contribution.accepted
X-WorkPress-Timestamp: 1787830000
```

### كود التحقق في خادم المستلم (PHP Verification Example):
```php
$payload   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WORKPRESS_SIGNATURE'] ?? '';
$secret    = 'YOUR_WEBHOOK_SECRET_KEY';

$expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

if (hash_equals($expected_signature, $signature)) {
    // الطلب موثوق وأصيل من WorkPress
    $data = json_decode($payload, true);
} else {
    // رفض الطلب - التوقيع غير صالح
    http_response_code(401);
    exit('Unauthorized');
}
```

---

## 🛠️ 4. خطوات الربط العملي مع المنصات الشائعة

### 1. الربط مع Discord:
1. في خادم Discord: **إعدادات القناة ➔ التكاملات (Integrations) ➔ إنشاء Webhook**.
2. انسخ رابط الـ Webhook.
3. في لوحة تحكم WorkPress: **الإعدادات ➔ خطافات الويب ➔ إضافة خطاف جديد**.
4. الصق الرابط، اختر نوع القالب **Discord**، وحدد الأحداث المطلوبة.
5. اضغط **[ فحص النبضة اللحظية ]** لإرسال رسالة تجريبية ملونة للقناة فوراً.

### 2. الربط مع Slack / Microsoft Teams:
* اتبع نفس الخطوات باختيار قالب **Slack** أو **Microsoft Teams** لإنشاء بطاقات تفاعلية غنية بالألوان وأزرار الانتقال المباشر للمهمة.

### 3. الربط مع Make.com أو Zapier:
* اختر قالب **Generic JSON** لاستقبال حمولة JSON مهيكلة بالكامل لاستخدامها في سيناريوهات الأتمتة المخصصة.

---
*تم بناء محرك خطافات الويب لضمان اتصال لحظي فائق السرعة دون أي تأثير على أداء لوحة التحكم.*
