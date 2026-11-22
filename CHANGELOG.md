# ประวัติเวอร์ชัน (CHANGELOG)

## v42 — 2026-11-22
- ฟอร์มลูกค้า: รับเบอร์บ้าน 9 หลัก (02–07) ด้วย นอกจากมือถือ 10 หลัก (06/08/09)

## v41 — 2026-11-22
- ฟอร์มลูกค้า (ขอใบเสนอราคา / ทดลองขับ / ติดต่อ / ลงทะเบียน): เบอร์โทรต้องขึ้นต้นด้วย 0 และครบ 10 หลักจึงบันทึกได้ (พิมพ์ขีด/ช่องว่างได้ ระบบตัดให้)
- เพิ่มช่อง LINE ID (ไม่บังคับ) — แสดงในหลังบ้าน, ไฟล์ Excel, ข้อความแจ้งเตือนกลุ่ม LINE และ n8n · ค้นหาด้วย LINE ID ได้
- ไม่ได้แก้ส่วนอื่นของเว็บ

## v40 — 2026-11-18
- ระบบสำรองข้อมูล: `ikssa_backup.sh` (สำรองทุกวัน, กู้ข้อมูล/หน้าเว็บ/รูป)
- ตัวติดตั้งสำรองข้อมูลอัตโนมัติก่อนอัปเดตทุกครั้ง และบันทึกเลขเวอร์ชันบนเซิร์ฟเวอร์
- โค้ดเว็บเหมือน v39 ทุกไฟล์

## ก่อนหน้า (จาก branch ikssa-deploy)
- 2026-11-04 · Web v39: Community menu (clubs + posts with photos/text), header two-row below 1536px
- 2026-10-29 · Web v38: lead notifications to LINE group / n8n, LINE webhook for group ID, setup script
- 2026-10-24 · Web v37: brand-name SEO (WebSite schema, aliases); primary domain script keeps extra domains in cert
- 2026-10-24 · Web v36: Cholburi Isuzu Group on about page, real timeline, group schema
- 2026-10-24 · Web v35 + Trooper 1989 photo import to activities
- 2026-10-24 · Web v34: gallery_images + Bi-Turbo slideshow/gallery; Drive photo import script
- 2026-10-24 · Web v33: 2.2 Bi-Turbo page, NEW menu slot, model prices per isuzu-tis.com, engine filter
- 2026-10-21 · Web v32: emergency 24h phone, SR/BST nearby เทพารักษ์ บางบ่อ, ContactPoint schema
- 2026-10-21 · Web v31: SSI อันดับ 1 ปี 2566 และ 2568
- 2026-10-21 · Web v30: /why page, area landing pages (สมุทรปราการ/ปริมณฑล/กรุงเทพฯ/ชลบุรี), SSI award + 24h emergency trust facts
- 2026-10-21 · Primary domain switch: defer old-domain redirect (avoid loops during DNS caching); rollback without backups
- 2026-10-21 · Switch primary domain to isuzukrungthep.com (two-phase, with rollback)
- 2026-10-21 · Web v29 (fix): one-time SEO description updates so installs no longer revert them
- 2026-10-21 · Web v29: branch nearby areas (e.g. Kaset near Ratchayothin), service area incl. Samut Prakan/Chonburi/vicinity, branch promos + quality FAQ
- 2026-10-21 · Web v28: Search Console/Bing verification, GA4 with PDPA consent, explicit AI crawler access
- 2026-10-21 · Web v27: Facebook share-link resolver uses crawler/browser headers (FB returns 400 otherwise)
- 2026-10-21 · Web v26: accept Facebook share links for live/video (server resolves to embeddable URL)
- 2026-10-21 · Web v25: service booking uses company booking system link (LINE-connected)
- 2026-10-21 · Redirect backup domains to ikssa.io with 301 + SSL on Apache
- 2026-10-21 · Web v24: fix re-run of migration 009 (FAQ group 'why')
- 2026-10-21 · Web v23: top bar with sales/service phones and social links
- 2026-10-21 · Web v22: SEO round - branch pages, upfit landing pages, keyword titles, why-choose-us FAQ, configurable site URL
- 2026-10-21 · Web v21: showroom photo banner on all page headers
- 2026-10-21 · Web v20: Activities page (slideshow or video), service content moved to Contact
- 2026-10-21 · Web v19: Happy Whale intro video section; whale video installer
- 2026-10-21 · Web v18: live section moves to top during live; staff-only live link tester
- 2026-10-21 · Web v17: full-screen showroom cover, remove car from cover
- 2026-10-21 · Web v16: showroom photo cover, contact buttons removed
- 2026-10-21 · Web v15: showroom cover hero on home; new teaser clip source
- 2026-10-21 · Web v14: my-MEMBER page and nav tab, 3D metallic headings
- 2026-10-21 · Web v13: metallic headings, showroom stage cards, half-page launch video; teaser video installer
- 2026-10-20 · Web v12: launch spotlight on home, campaign bar, visible second-row nav, fixed mobile menu, home quick links
- 2026-10-20 · Web v11: keep new sections below hero after admin reorders
- 2026-10-20 · Web v10: launch/live campaign page with lead capture and nav tab
- 2026-10-20 · Web v9: pickup/PPV model structure, grades & prices, test drive page, FAQ, schema.org + llms.txt
- 2026-10-20 · Add TIS compare-page specs crawler
- 2026-10-20 · Run TIS dump in Playwright Docker image (Ubuntu 26.04 unsupported)
- 2026-10-20 · Add isuzu-tis.com model data dump script
- 2026-10-20 · Add web v8: commercial category card points to equipped pickups
- 2026-10-20 · Add model images/prices import from isuzu-tis.com
- 2026-10-20 · Add web v7: industry image lightbox
- 2026-10-20 · Add industry images for retail/SME, fiberglass canopy and stake cage
- 2026-10-20 · Add web v6 (industry slider, tel fix) and industry gallery images
- 2026-10-20 · Add ikssa.io industries setup script
