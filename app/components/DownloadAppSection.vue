<script setup>
  const { mobile_app_links: links } = useLayoutStore();
</script>

<template>
  <section class="bg-gray-50 py-16 md:py-24 overflow-hidden">
    <div class="container px-4" id="download-app-section">
      <div class="grid md:grid-cols-2 items-center gap-12 lg:gap-20">
        
        <!-- Content (Right side in RTL) -->
        <div class="flex flex-col max-w-2xl">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span class="text-brand-700">كل خدمات بيتك الآن .. في</span>
            <span class="text-gray-900 block mt-2">تطبيق واحد !</span>
          </h2>
          <p class="text-base md:text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
            حمّل التطبيق واطلب الخدمة اللي تحتاجها في أي وقت وبكل راحة، كل شي من جوالك وبضغطة زر وحدة.
          </p>
          
          <div class="flex flex-col gap-4 mb-10">
            <div class="inline-flex items-center gap-3 text-gray-700 font-medium">
              <svg class="w-5 h-5 text-brand-700 stroke-current" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.66674 9.33328C2.54059 9.33371 2.4169 9.29833 2.31005 9.23126C2.20319 9.16419 2.11757 9.06818 2.06311 8.95438C2.00865 8.84058 1.9876 8.71367 2.00241 8.58838C2.01721 8.4631 2.06726 8.34458 2.14674 8.24661L8.74674 1.44661C8.79625 1.38947 8.86372 1.35085 8.93806 1.3371C9.01241 1.32335 9.08923 1.33529 9.1559 1.37095C9.22257 1.40661 9.27513 1.46388 9.30497 1.53335C9.3348 1.60283 9.34013 1.68038 9.32008 1.75328L8.04008 5.76661C8.00233 5.86763 7.98966 5.97629 8.00314 6.08328C8.01662 6.19027 8.05585 6.2924 8.11747 6.3809C8.17909 6.46939 8.26126 6.54162 8.35693 6.59139C8.45259 6.64115 8.55891 6.66696 8.66674 6.66661H13.3334C13.4596 6.66618 13.5833 6.70156 13.6901 6.76863C13.797 6.8357 13.8826 6.93171 13.937 7.04551C13.9915 7.15931 14.0125 7.28622 13.9977 7.41151C13.9829 7.53679 13.9329 7.65531 13.8534 7.75328L7.25341 14.5533C7.2039 14.6104 7.13644 14.649 7.06209 14.6628C6.98774 14.6765 6.91093 14.6646 6.84426 14.6289C6.77759 14.5933 6.72502 14.536 6.69519 14.4665C6.66535 14.3971 6.66002 14.3195 6.68008 14.2466L7.96008 10.2333C7.99782 10.1323 8.0105 10.0236 7.99702 9.91661C7.98354 9.80962 7.9443 9.70749 7.88268 9.61899C7.82106 9.5305 7.73889 9.45827 7.64323 9.40851C7.54756 9.35874 7.44125 9.33293 7.33341 9.33328H2.66674Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>دفع آمن ومضمون</span>
            </div>

            <div class="inline-flex items-center gap-3 text-gray-700 font-medium">
              <svg class="w-5 h-5 text-brand-700 stroke-current" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.3334 8.00014C11.3334 11.3335 9.00008 13.0001 6.22675 13.9668C6.08152 14.016 5.92377 14.0137 5.78008 13.9601C3.00008 13.0001 0.666748 11.3335 0.666748 8.00014V3.33347C0.666748 3.15666 0.736986 2.98709 0.86201 2.86207C0.987035 2.73704 1.1566 2.6668 1.33341 2.6668C2.66675 2.6668 4.33341 1.8668 5.49341 0.85347C5.63465 0.732803 5.81432 0.666504 6.00008 0.666504C6.18585 0.666504 6.36551 0.732803 6.50675 0.85347C7.67341 1.87347 9.33341 2.6668 10.6667 2.6668C10.8436 2.6668 11.0131 2.73704 11.1382 2.86207C11.2632 2.98709 11.3334 3.15666 11.3334 3.33347V8.00014Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>طلب الخدمة في ثواني</span>
            </div>

            <div class="inline-flex items-center gap-3 text-gray-700 font-medium">
              <svg class="w-5 h-5 text-brand-700 stroke-current" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5341 6.66666C14.8385 8.16086 14.6215 9.71427 13.9193 11.0679C13.2171 12.4214 12.072 13.4934 10.6751 14.1049C9.27816 14.7164 7.71382 14.8305 6.24293 14.4282C4.77205 14.026 3.48353 13.1316 2.59225 11.8943C1.70097 10.657 1.26081 9.15148 1.34518 7.62892C1.42954 6.10635 2.03332 4.65872 3.05583 3.52744C4.07835 2.39616 5.45779 1.64961 6.96411 1.4123C8.47043 1.17498 10.0126 1.46123 11.3334 2.22333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M6 7.33317L8 9.33317L14.6667 2.6665" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>تتبع الفني لحظة بلحظة</span>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <a :href="links?.google_play || '#'" class="z-20 border border-gray-200 shadow-sm text-nowrap text-gray-900 bg-white hover:bg-gray-50 rounded-2xl py-3 px-6 flex flex-row gap-3 items-center justify-center w-[16rem] sm:w-[12rem] lg:w-[14rem] transition-colors">
              <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" width="28.95" height="32" viewBox="0 0 256 283">
                <path fill="#EA4335" d="M119.553 134.916L1.06 259.061a32.14 32.14 0 0 0 47.062 19.071l133.327-75.934z" />
                <path fill="#FBBC04" d="M239.37 113.814L181.715 80.79l-64.898 56.95l65.162 64.28l57.216-32.67a31.345 31.345 0 0 0 0-55.537z" />
                <path fill="#4285F4" d="M1.06 23.487A30.6 30.6 0 0 0 0 31.61v219.327a32.3 32.3 0 0 0 1.06 8.124l122.555-120.966z" />
                <path fill="#34A853" d="m120.436 141.274l61.278-60.483L48.564 4.503A32.85 32.85 0 0 0 32.051 0C17.644-.028 4.978 9.534 1.06 23.399z" />
              </svg>
              <div class="flex flex-col items-start tracking-wide">
                <span v-text="$t('download_app.get_it_on')" class="text-[11px] text-gray-500"></span>
                <span class="text-[16px] font-bold leading-none">Google Play</span>
              </div>
            </a>
            <a :href="links?.app_store || '#'" class="z-20 border border-gray-200 shadow-sm text-nowrap text-gray-900 bg-white hover:bg-gray-50 rounded-2xl py-3 px-6 flex flex-row gap-3 items-center justify-center w-[16rem] sm:w-[12rem] lg:w-[14rem] transition-colors">
              <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 15 15">
                <path fill="currentColor" d="M7.875 2.937A.37.37 0 0 1 7.5 2.57C7.5 1.15 8.676 0 10.124 0a.37.37 0 0 1 .375.367c0 1.42-1.175 2.57-2.624 2.57" />
                <path fill="currentColor" d="M7.875 2.937A.37.37 0 0 1 7.5 2.57C7.5 1.15 8.676 0 10.124 0a.37.37 0 0 1 .375.367c0 1.42-1.175 2.57-2.624 2.57m5.475 7.731c.145.106.192.3.11.458C12.14 13.712 11.087 15 10.125 15c-.448 0-.888-.142-1.317-.418a1.99 1.99 0 0 0-2.073-.044c-.52.305-1.015.462-1.485.462c-1.415 0-3.75-4.267-3.75-6.608c0-2.5 1.339-4.406 3.375-4.406q1.437-.001 2.48.419c.294.118.627.11.914-.025c.564-.266 1.308-.394 2.23-.394c1.127 0 2.11.55 2.926 1.615a.36.36 0 0 1-.075.514c-.911.67-1.35 1.421-1.35 2.277c0 .855.439 1.607 1.35 2.276" />
              </svg>
              <div class="flex flex-col items-start tracking-wide">
                <span v-text="$t('download_app.download_on_the')" class="text-[11px] text-gray-500"></span>
                <span class="text-[16px] font-bold leading-none">App Store</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Phone Image (Left side in RTL) -->
        <div class="flex justify-center md:justify-end w-full">
          <img src="/images/mobile-app.webp" class="w-[90%] md:w-full max-h-[550px] object-contain" alt="App Screenshot" />
        </div>

      </div>
    </div>
  </section>
</template>
