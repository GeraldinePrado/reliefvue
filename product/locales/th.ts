/**
 * Thai dictionary for the recipient app.
 *
 * Keyed by the English source string, so a missing entry falls back to English
 * instead of breaking the screen. Review with a native Thai editor before the
 * public link is shared: eligibility and identity wording is the sensitive part.
 */
export const th: Record<string, string> = {
  /* frame */
  "Recipient app · Thailand": "แอปผู้รับความช่วยเหลือ · ไทย",
  "The household side of the relief record.": "มุมมองครัวเรือนในบันทึกการช่วยเหลือ",
  "A phone-first web app. Verify once, see only the responses that cover your district, and follow your grant without visiting an office.":
    "เว็บแอปที่ออกแบบสำหรับมือถือ ยืนยันตัวตนครั้งเดียว เห็นเฉพาะประกาศที่ครอบคลุมอำเภอของคุณ และติดตามเงินช่วยเหลือได้โดยไม่ต้องเดินทางไปที่สำนักงาน",
  "Verify identity and residence": "ยืนยันตัวตนและที่อยู่",
  "Request the fixed grant in an active response": "ขอรับเงินช่วยเหลือจำนวนคงที่ในประกาศที่เปิดอยู่",
  "Follow review, signatures and payout": "ติดตามการตรวจสอบ การลงนาม และการจ่ายเงิน",
  "Local demo · fictional data": "เดโมภายในเครื่อง · ข้อมูลสมมติ",
  "Staff workspace →": "พื้นที่ทำงานเจ้าหน้าที่ →",
  "This is the recipient app.": "นี่คือแอปสำหรับผู้รับความช่วยเหลือ",
  "You are signed in as staff. Open the operations workspace instead.":
    "คุณเข้าสู่ระบบในฐานะเจ้าหน้าที่ กรุณาเปิดพื้นที่ทำงานปฏิบัติการแทน",
  "Go to staff workspace": "ไปที่พื้นที่ทำงานเจ้าหน้าที่",
  "Opening ReliefVue": "กำลังเปิด ReliefVue",

  /* sign in */
  "Disaster relief · Thailand": "บรรเทาภัยพิบัติ · ไทย",
  "Get help on your phone.": "ขอความช่วยเหลือผ่านมือถือ",
  "Enter the code.": "กรอกรหัส",
  "Sign in with a Thai mobile number. In this local build, use a fictional number and the code shown on screen.":
    "เข้าสู่ระบบด้วยเบอร์มือถือไทย ในเดโมนี้ให้ใช้เบอร์สมมติและรหัสที่แสดงบนหน้าจอ",
  "We sent a six-digit code to {phone}.": "เราส่งรหัส 6 หลักไปที่ {phone} แล้ว",
  "Mobile number": "เบอร์มือถือ",
  "Thai mobile number, for example 081 234 5678.": "เบอร์มือถือไทย เช่น 081 234 5678",
  "Send code": "ส่งรหัส",
  "Demo code": "รหัสเดโม",
  "Tap to fill": "แตะเพื่อกรอก",
  "Six-digit code": "รหัส 6 หลัก",
  Continue: "ดำเนินการต่อ",
  "Use a different number": "ใช้เบอร์อื่น",
  "What you will need": "สิ่งที่ต้องเตรียม",
  "Thai national ID, or passport and TM30 for foreign residents":
    "บัตรประชาชนไทย หรือหนังสือเดินทางและ TM30 สำหรับชาวต่างชาติที่พักอาศัย",
  "An address reference: utility bill, lease or local attestation":
    "หลักฐานที่อยู่: ใบแจ้งค่าน้ำค่าไฟ สัญญาเช่า หรือหนังสือรับรองจากท้องถิ่น",
  "A PromptPay number, or a Solana wallet address": "หมายเลขพร้อมเพย์ หรือที่อยู่กระเป๋า Solana",
  "Only the operating team can see your identity and address. The public ledger shows totals, never your name.":
    "เฉพาะทีมปฏิบัติการเท่านั้นที่เห็นข้อมูลบัตรประชาชนและที่อยู่ของคุณ บัญชีสาธารณะแสดงเฉพาะยอดรวม ไม่แสดงชื่อของคุณ",
  "Or open a demo household": "หรือเปิดครัวเรือนตัวอย่าง",
  "Could not send a code.": "ไม่สามารถส่งรหัสได้",
  "Could not verify the code.": "ไม่สามารถยืนยันรหัสได้",
  "Demo sign in failed.": "เข้าสู่ระบบเดโมไม่สำเร็จ",

  /* onboarding */
  "Who is asking for help?": "ใครเป็นผู้ขอความช่วยเหลือ",
  "Where do you live?": "คุณอาศัยอยู่ที่ไหน",
  "How should we send it?": "ต้องการให้เราโอนเงินอย่างไร",
  "Use the name on your documents. One household can hold one account per disaster response.":
    "ใช้ชื่อตามเอกสารของคุณ หนึ่งครัวเรือนมีได้หนึ่งบัญชีต่อหนึ่งประกาศ",
  "Your verified district must be on the affected list for a response.":
    "อำเภอที่ยืนยันแล้วของคุณต้องอยู่ในรายชื่อพื้นที่ที่ได้รับผลกระทบ",
  "A fixed grant is paid after review and two executive signatures.":
    "เงินช่วยเหลือจำนวนคงที่จะจ่ายหลังการตรวจสอบและลายเซ็นผู้บริหารสองคน",
  "Step {step} of 3": "ขั้นที่ {step} จาก 3",
  "Identity document": "เอกสารยืนยันตัวตน",
  "Thai national": "คนไทย",
  "Foreign resident": "ชาวต่างชาติที่พักอาศัย",
  "Full name": "ชื่อ-นามสกุล",
  "Name on the document": "ชื่อตามเอกสาร",
  "Thai national ID": "บัตรประชาชนไทย",
  "Passport or alien ID": "หนังสือเดินทางหรือบัตรต่างด้าว",
  "13 digits. Checked with the official checksum.": "13 หลัก ตรวจสอบด้วยสูตร checksum ทางการ",
  "Document number, 6–20 characters.": "หมายเลขเอกสาร 6–20 ตัวอักษร",
  "TM30 receipt": "ใบรับแจ้ง TM30",
  "Filed by your landlord or host. Used as corroboration, not as the only address proof.":
    "ยื่นโดยเจ้าของที่พักหรือผู้ให้ที่พัก ใช้เป็นหลักฐานประกอบ ไม่ใช่หลักฐานที่อยู่เพียงอย่างเดียว",
  "Address evidence": "หลักฐานที่อยู่",
  "A utility bill, lease or local-authority attestation reference.":
    "อ้างอิงใบแจ้งค่าน้ำค่าไฟ สัญญาเช่า หรือหนังสือรับรองจากท้องถิ่น",
  "Address evidence type": "ประเภทหลักฐานที่อยู่",
  "Utility bill": "ใบแจ้งค่าน้ำค่าไฟ",
  Lease: "สัญญาเช่า",
  "Local authority attestation": "หนังสือรับรองจากท้องถิ่น",
  "TM30 only (corroboration)": "TM30 เท่านั้น (หลักฐานประกอบ)",
  "Reference or document number": "หมายเลขอ้างอิงหรือเลขที่เอกสาร",
  "TM30 only exists for foreign residents. Thai nationals are verified with their national ID plus address evidence. This local build does not query DOPA or NDID.":
    "TM30 มีเฉพาะชาวต่างชาติ คนไทยยืนยันด้วยบัตรประชาชนและหลักฐานที่อยู่ เดโมนี้ไม่ได้เชื่อมต่อ DOPA หรือ NDID",
  Province: "จังหวัด",
  District: "อำเภอ",
  Subdistrict: "ตำบล",
  "House or unit address": "ที่อยู่บ้านหรือห้อง",
  "Kept private. Never shown on the public ledger.": "เก็บเป็นความลับ ไม่แสดงในบัญชีสาธารณะ",
  "People in the household": "จำนวนคนในครัวเรือน",
  "Monthly income": "รายได้ต่อเดือน",
  "Your district is checked against each active response. If it is not listed, that response is not open to you.":
    "อำเภอของคุณจะถูกตรวจสอบกับแต่ละประกาศที่เปิดอยู่ หากไม่อยู่ในรายชื่อ คุณจะขอรับความช่วยเหลือจากประกาศนั้นไม่ได้",
  PromptPay: "พร้อมเพย์",
  "Baht to your mobile number. Requires our bank/PSP partner.":
    "เงินบาทเข้าหมายเลขมือถือของคุณ ต้องใช้พันธมิตรธนาคาร/ผู้ให้บริการชำระเงิน",
  "Solana wallet": "กระเป๋า Solana",
  "Receive USDC. You can cash out later.": "รับ USDC และแลกเป็นเงินสดได้ภายหลัง",
  "PromptPay mobile number": "หมายเลขพร้อมเพย์",
  "The number registered with PromptPay.": "หมายเลขที่ลงทะเบียนพร้อมเพย์ไว้",
  "Wallet address": "ที่อยู่กระเป๋า",
  "Leave blank and we will create a demo wallet for you.": "เว้นว่างไว้ได้ เราจะสร้างกระเป๋าเดโมให้คุณ",
  "Paste a Solana address or leave blank": "วางที่อยู่ Solana หรือเว้นว่าง",
  Review: "ตรวจสอบ",
  Name: "ชื่อ",
  Identity: "ตัวตน",
  Residence: "ที่พักอาศัย",
  Payout: "การจ่ายเงิน",
  "USDC wallet": "กระเป๋า USDC",
  "Verification is simulated in this local build. Production needs a DOPA/NDID-authorised identity channel.":
    "การยืนยันตัวตนเป็นการจำลองในเดโมนี้ ระบบจริงต้องใช้ช่องทางที่ได้รับอนุญาตจาก DOPA/NDID",
  Back: "ย้อนกลับ",
  "Finish verification": "ยืนยันเสร็จสิ้น",
  "Household verified in the local demo.": "ยืนยันครัวเรือนแล้วในเดโม",
  "Could not save your details.": "ไม่สามารถบันทึกข้อมูลของคุณได้",

  /* home */
  Home: "หน้าแรก",
  Request: "ขอความช่วยเหลือ",
  Activity: "กิจกรรม",
  Profile: "โปรไฟล์",
  "Loading your household": "กำลังโหลดข้อมูลครัวเรือน",
  "Could not load your account.": "ไม่สามารถโหลดบัญชีของคุณได้",
  "Your profile": "โปรไฟล์ของคุณ",
  "Recipient sections": "ส่วนต่าง ๆ สำหรับผู้รับ",
  "Sawasdee, {name}": "สวัสดี {name}",
  "Identity verified": "ยืนยันตัวตนแล้ว",
  "Your request": "คำขอของคุณ",
  "The team needs more information.": "ทีมงานต้องการข้อมูลเพิ่มเติม",
  "Update request": "อัปเดตคำขอ",
  "This request was not approved.": "คำขอนี้ไม่ได้รับอนุมัติ",
  "Sent to PromptPay {destination}.": "โอนไปพร้อมเพย์ {destination} แล้ว",
  "{amount} sent to your wallet.": "โอน {amount} เข้ากระเป๋าของคุณแล้ว",
  "A response covers your district.": "มีประกาศที่ครอบคลุมอำเภอของคุณ",
  "{title} · fixed grant {amount} per household.": "{title} · เงินช่วยเหลือ {amount} ต่อครัวเรือน",
  "Request support": "ขอรับความช่วยเหลือ",
  "No active response covers you yet.": "ยังไม่มีประกาศที่ครอบคลุมคุณ",
  "Your account is ready. When a response is activated for {district}, it will appear here.":
    "บัญชีของคุณพร้อมแล้ว เมื่อมีประกาศสำหรับ {district} จะแสดงที่นี่",
  "Open responses": "ประกาศที่เปิดอยู่",
  "See all": "ดูทั้งหมด",
  "There is no active disaster response today.": "วันนี้ยังไม่มีประกาศภัยพิบัติที่เปิดอยู่",
  "{count} districts · {amount} grant": "{count} อำเภอ · เงินช่วยเหลือ {amount}",
  "Not eligible": "ไม่เข้าเกณฑ์",
  "Your wallet": "กระเป๋าของคุณ",
  "PromptPay preferred": "เลือกพร้อมเพย์",
  Copy: "คัดลอก",
  received: "ได้รับแล้ว",
  payouts: "ครั้งที่จ่าย",
  "How your grant works": "เงินช่วยเหลือทำงานอย่างไร",
  "One request per response.": "หนึ่งคำขอต่อหนึ่งประกาศ",
  "Your household cannot request the same grant twice.": "ครัวเรือนของคุณขอเงินช่วยเหลือเดิมซ้ำไม่ได้",
  "A reviewer checks your details.": "เจ้าหน้าที่ตรวจสอบข้อมูลของคุณ",
  "Residence and duplicate checks use your verified record.":
    "การตรวจที่อยู่และการขอซ้ำใช้ข้อมูลที่ยืนยันแล้วของคุณ",
  "Two executives sign the payout.": "ผู้บริหารสองคนลงนามจ่ายเงิน",
  "Then it is sent to PromptPay or your wallet.": "จากนั้นโอนเข้าพร้อมเพย์หรือกระเป๋าของคุณ",

  /* timeline */
  Submitted: "ส่งแล้ว",
  Reviewed: "ตรวจสอบแล้ว",
  Signatures: "ลงนาม",
  Paid: "จ่ายแล้ว",

  /* statuses */
  "Under review": "อยู่ระหว่างตรวจสอบ",
  "Needs information": "ต้องการข้อมูลเพิ่มเติม",
  "Awaiting signatures": "รอการลงนาม",
  "Not approved": "ไม่อนุมัติ",
  Sent: "ส่งแล้ว",
  Verified: "ยืนยันแล้ว",
  Pending: "รอดำเนินการ",
  Unverified: "ยังไม่ยืนยัน",
  Active: "เปิดใช้งาน",
  Draft: "ฉบับร่าง",
  Closed: "ปิดแล้ว",

  /* request */
  "What happened?": "เกิดอะไรขึ้น",
  "Describe the damage in your own words. Do not include ID numbers.":
    "อธิบายความเสียหายด้วยคำของคุณเอง อย่าใส่เลขบัตรประชาชน",
  "Photo or document name": "ชื่อรูปภาพหรือเอกสาร",
  "Optional. Uploads are not wired in this local build.": "ไม่บังคับ เดโมนี้ยังไม่รองรับการอัปโหลดจริง",
  "Submitting does not guarantee a grant. A reviewer checks residence and duplicate rules.":
    "การส่งคำขอไม่ได้ยืนยันว่าจะได้รับเงิน เจ้าหน้าที่จะตรวจที่อยู่และกฎการขอซ้ำ",
  "Submit request": "ส่งคำขอ",
  "Available support": "ความช่วยเหลือที่เปิดอยู่",
  "Request a grant": "ขอรับเงินช่วยเหลือ",
  "Only responses that include your verified district are open to you.":
    "คุณขอได้เฉพาะประกาศที่ครอบคลุมอำเภอที่ยืนยันแล้วของคุณ",
  "No active response": "ไม่มีประกาศที่เปิดอยู่",
  "There is nothing to request right now. Your account stays ready.": "ยังไม่มีรายการให้ขอ บัญชีของคุณพร้อมใช้งาน",
  "Request {amount}": "ขอรับ {amount}",
  "Nothing else is open to your district right now. Your existing request stays visible in Activity.":
    "ขณะนี้ยังไม่มีรายการอื่นที่เปิดให้อำเภอของคุณ คำขอเดิมของคุณยังดูได้ในกิจกรรม",
  "Request submitted. A reviewer will check it.": "ส่งคำขอแล้ว เจ้าหน้าที่จะตรวจสอบ",
  "Could not submit the request.": "ไม่สามารถส่งคำขอได้",
  "fixed grant": "เงินช่วยเหลือคงที่",
  "Your district is on the list": "อำเภอของคุณอยู่ในรายชื่อ",
  "No request yet for this response": "ยังไม่มีคำขอสำหรับประกาศนี้",

  /* activity */
  "Your record": "บันทึกของคุณ",
  "Requests and payouts for this household.": "คำขอและการจ่ายเงินของครัวเรือนนี้",
  "No requests yet": "ยังไม่มีคำขอ",
  "When you request a grant it will appear here with its status.":
    "เมื่อคุณขอเงินช่วยเหลือ รายการจะแสดงที่นี่พร้อมสถานะ",
  "Find a response": "ค้นหาประกาศ",
  "Wallet payout": "จ่ายเข้ากระเป๋า",

  /* profile */
  Document: "เอกสาร",
  Number: "หมายเลข",
  Household: "ครัวเรือน",
  Address: "ที่อยู่",
  People: "จำนวนคน",
  Income: "รายได้",
  Preference: "ช่องทางที่เลือก",
  Wallet: "กระเป๋า",
  Received: "ได้รับแล้ว",
  "Need to correct something?": "ต้องการแก้ไขข้อมูล?",
  "In this build, sign out and open a fresh demo household to test another path. In production, corrections would go through a staff review without creating a second account.":
    "ในเดโมนี้ ให้ออกจากระบบแล้วเปิดครัวเรือนตัวอย่างใหม่เพื่อทดลองเส้นทางอื่น ในระบบจริง การแก้ไขจะผ่านการตรวจสอบของเจ้าหน้าที่โดยไม่ต้องสร้างบัญชีที่สอง",
  "Verified in the local demo only. Not connected to DOPA or NDID.":
    "ยืนยันในเดโมเท่านั้น ไม่ได้เชื่อมต่อ DOPA หรือ NDID",
  "Sign out": "ออกจากระบบ",
  "About ReliefVue": "เกี่ยวกับ ReliefVue",
  "Signed out.": "ออกจากระบบแล้ว",
  "Cash out to PromptPay": "ถอนเงินเข้าพร้อมเพย์",
  "Keep in wallet": "เก็บไว้ในกระเป๋า",
  "Cash-out requested to PromptPay (demo).": "ขอถอนเงินเข้าพร้อมเพย์แล้ว (เดโม)",
  "Funds stay in your wallet.": "เงินยังอยู่ในกระเป๋าของคุณ",
  "Could not update cash-out.": "ไม่สามารถอัปเดตการถอนเงินได้",

  /* eligibility reasons returned by the API */
  "Complete verification first.": "กรุณายืนยันตัวตนให้เสร็จก่อน",
  "This response is for a different province.": "ประกาศนี้สำหรับจังหวัดอื่น",
  "Your district is not in the affected area list.": "อำเภอของคุณไม่อยู่ในรายชื่อพื้นที่ที่ได้รับผลกระทบ",
  "Your household already has a request for this response.": "ครัวเรือนของคุณมีคำขอสำหรับประกาศนี้แล้ว",

  /* income bands */
  "Under ฿10,000 / month": "ต่ำกว่า ฿10,000 / เดือน",
  "฿10,000 – ฿20,000 / month": "฿10,000 – ฿20,000 / เดือน",
  "฿20,000 – ฿35,000 / month": "฿20,000 – ฿35,000 / เดือน",
  "Over ฿35,000 / month": "มากกว่า ฿35,000 / เดือน",
  "Prefer not to say": "ไม่ประสงค์จะระบุ",
};
