<template>
  <section class="py-16 md:py-20 bg-brand-50/50">
    <div class="container px-4 text-center max-w-3xl mx-auto flex flex-col items-center">
      <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        لا تفوت أي عرض جديد!
      </h2>
      <p class="text-brand-700 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
        اشترك في نشرتنا البريدية لتصلك أحدث الخصومات والعروض الحصرية مباشرة على بريدك الإلكتروني.
      </p>

      <form @submit.prevent class="w-full max-w-md flex items-stretch gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
        <input
          type="email"
          placeholder="بريدك الإلكتروني"
          required
          class="grow bg-transparent border-none focus:ring-0 px-4 text-sm md:text-base outline-none text-gray-800 placeholder:text-gray-400"
        />
        <button
          type="submit"
          class="shrink-0 bg-brand-700 hover:bg-brand-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm md:text-base"
        >
          اشترك
        </button>
      </form>
    </div>
  </section>
</template>
