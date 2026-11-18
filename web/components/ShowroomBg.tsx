/** พื้นหลังรูปโชว์รูม (ใช้กับหัวหน้าเว็บที่ยังไม่มีรูปแบนเนอร์ของตัวเอง) */
export function ShowroomBg({ position = 'center 60%', priority = true, dim = false }: { position?: string; priority?: boolean; dim?: boolean }) {
  return (
    <>
      <picture>
        <source media="(max-width: 767px)" srcSet="/cover/showroom-m.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cover/showroom.webp" alt="" aria-hidden width={2400} height={1351}
          className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }}
          fetchPriority={priority ? 'high' : 'auto'} />
      </picture>
      {/* ไล่เงาให้อ่านตัวอักษรได้: มือถือไล่จากล่าง · คอมไล่จากซ้าย */}
      <span className="absolute inset-0 bg-linear-to-t from-[#060a14]/95 via-[#060a14]/70 to-[#060a14]/35 lg:hidden" aria-hidden />
      <span className="absolute inset-0 hidden bg-linear-to-r from-[#060a14]/95 via-[#060a14]/72 via-40% to-[#060a14]/20 lg:block" aria-hidden />
      {/* หัวหน้าที่ข้อความยาว: หรี่รูปลงอีกชั้นให้อ่านง่าย */}
      {dim && <span className="absolute inset-0 bg-[#060a14]/55 lg:bg-[#060a14]/25" aria-hidden />}
      <span className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-[#060a14]/70 to-transparent" aria-hidden />
    </>
  );
}
