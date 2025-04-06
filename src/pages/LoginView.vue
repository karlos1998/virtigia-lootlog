<script setup>
import { useRouter } from 'vue-router'
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'


const submit = () => {
  const query = new URLSearchParams({
    client_id: import.meta.env.VITE_MARGATRON_OAUTH_APP_ID,
    redirect_uri: import.meta.env.VITE_MARGATRON_OAUTH_APP_CALLBACK,
    response_type: 'code',
    scope: '',
    state: crypto.randomUUID(),
  })

  window.location.href = `${import.meta.env.VITE_MARGATRON_OATH_APP_URL}?${query}`
}
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">

<!--        <FormCheckRadio-->
<!--          v-model="form.remember"-->
<!--          name="remember"-->
<!--          label="Remember"-->
<!--          :input-value="true"-->
<!--        />-->

        <template #footer>
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Zaloguj przy użyciu konta Margatron" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
