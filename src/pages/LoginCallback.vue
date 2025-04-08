<script setup>
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import { ApiService } from '@/services/api.service.js'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter();
const apiService = new ApiService()

onMounted(() => {
  const code = route.query.code
  if (code) {
    apiService.lootlog
      .oauthCallback({ code })
      .then(async (data) => {
        localStorage.setItem("jwt", data.token);
        await router.push('/');
      })
      .catch(async () => {
        await router.push('/login');
      })
  }
})

</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form>
        Autoryzacja, proszę czekać....
        <template #footer>
          <BaseButtons>
            <BaseButton :disabled="true" color="info" label="Wczytywanie..." />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
