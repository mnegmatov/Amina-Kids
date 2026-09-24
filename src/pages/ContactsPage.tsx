import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Контакты и Шоурум</h1>
        <p className="text-xs text-[#7A695D]">Будем рады видеть вас в нашем уютном флагманском пространстве в Душанбе</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="p-8 bg-white rounded-3xl border border-[#E8E0D5] shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#33261D] border-b border-[#E8E0D5] pb-3">Наши данные</h3>

          <div className="space-y-4 text-xs text-[#33261D]">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#E2A69B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#4A3A0B]">Адрес шоурума:</strong>
                <p className="text-[#7A695D]">г. Душанбе, ул. Рудаки, д. 22</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#E2A69B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#4A3A0B]">Телефон:</strong>
                <a href="tel:+992990123456" className="text-[#E2A69B] font-bold hover:underline">
                  +992 (99) 012-34-56
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#E2A69B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#4A3A0B]">Email:</strong>
                <p className="text-[#7A695D]">hello@aminakids.tj</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#E2A69B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#4A3A0B]">Режим работы:</strong>
                <p className="text-[#7A695D]">Ежедневно с 10:00 до 21:00 без перерывов</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="p-5 sm:p-8 bg-[#FAF6F0] rounded-3xl border border-[#E8E0D5] space-y-4">
          <h3 className="text-base font-bold text-[#33261D]">Задать вопрос или записаться в шоурум</h3>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-[#33261D]">Сообщение отправлено!</h4>
              <p className="text-xs text-[#7A695D]">Мы свяжемся с вами в течение 15 минут.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#33261D] mb-1.5">Ваше имя</label>
                <input
                  type="text"
                  required
                  placeholder="Елена"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#E8E0D5] rounded-xl text-base sm:text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#33261D] mb-1.5">Телефон</label>
                <input
                  type="tel"
                  required
                  placeholder="+992 (99) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#E8E0D5] rounded-xl text-base sm:text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#33261D] mb-1.5">Сообщение</label>
                <textarea
                  rows={3}
                  placeholder="Какой размер посоветуете для ребенка 2 лет?..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[80px] bg-white border border-[#E8E0D5] rounded-xl text-base sm:text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 min-h-[46px] bg-[#E2A69B] text-white font-bold rounded-xl hover:bg-[#C88B80] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
              >
                Отправить вопрос
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
