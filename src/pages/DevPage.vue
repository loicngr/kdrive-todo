<template>
  <q-page class="row items-center column justify-center">
    <q-spinner-dots
      color="primary"
      size="lg"
    />
    <div>
      {{ ls }}
    </div>
    <q-btn
      label="Connect"
      @click="connect"
    />
  </q-page>
</template>

<script lang="ts" setup>
import { createClient } from 'webdav'
import { ref } from 'vue'

const ls = ref()

async function connect () {
  const client = createClient(
    `https://cloud.lewebfrancais.fr/remote.php/webdav/`,
    {
      username: 'test',
      password: 'FAPJK-MAVWJ-UKOIW-VWOIR',
    },
  )

  try {
    ls.value = await client.getDirectoryContents('')
  } catch (e) {
    console.error(e)
    ls.value = e
  }
}
</script>
