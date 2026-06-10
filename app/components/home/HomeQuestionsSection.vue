<template>
  <section class="py-12 md:py-32 bg-[#FCFAFF]">
    <div class="container flex flex-col gap-10">
      <h3 v-text="$t('home.questions.title')" class="font-bold text-start" style="color: #7A3E98; font-size: 30px; line-height: 40px; letter-spacing: 0px;"></h3>
      <QuestionCollapse heading-class="shadow-xs rounded-lg" title-class="text-gray-800 rounded-lg" :title-style="'justify-content: space-between; background: #FAF7FC; padding: 24px;'" body-class="p-5" />
    </div>
  </section>
</template>
