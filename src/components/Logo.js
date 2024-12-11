import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image src="/assets/logo.png" alt="Logo" width={40} height={40} className="mr-2" />
      <span className="text-2xl font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>
        FITSHARE
      </span>
    </div>
  );
}
