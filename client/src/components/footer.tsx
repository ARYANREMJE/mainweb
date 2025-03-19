export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-800 text-slate-300 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>© {currentYear} Tunnel Fan Monitoring System. All rights reserved.</p>
        <p className="mt-1 text-slate-400">Powered by ESP32, NRF24L01, and Firebase</p>
      </div>
    </footer>
  );
}
