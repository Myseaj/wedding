<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { supabase } from './lib/supabaseClient'

let photos = ref([])
let loading = ref(false)

const uploadFile = async (event) => {
  console.log(event)
  loading.value = true
  for (var i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i]
    const { data, error } = await supabase
      .storage
      .from('photos_public')
      .upload(file.name, file)
      const url = supabase.storage.from('photos_public').getPublicUrl(file.name)
      data.url = url.data.publicUrl
    if (error) {
      console.error(error)
    } else {
      photos.value.push(data)
    }
  }
  await listFiles()
  loading.value = false
}

const listFiles = async () => {
  const { data, error } = await supabase
    .storage
    .from('photos_public')
    .list()
  if (error) {
    console.error(error)
  } else {
    data.forEach(photo => {
      const url = supabase.storage.from('photos_public').getPublicUrl(photo.name, {download:true})
      photo.url = url.data.publicUrl
    })
    photos.value = data
  }
  console.log(photos.value)
}

onMounted(async () => {
  loading.value = true
  await listFiles()
  loading.value = false
})

</script>

<template>
  <v-col align="center">
    <v-card class="mx-4">
      <v-card-title class="bg-indigo">Hochzeitsbilder</v-card-title>
      <v-card-text class="mt-4">
        <v-file-input chips variant="outlined" label="Fotos hochladen" @change="uploadFile" multiple></v-file-input>
      </v-card-text>
    </v-card>
  </v-col>
  <v-progress-linear v-if="loading" indeterminate color="indigo"></v-progress-linear>
    
    <v-row align="center" justify="center" class="mx-4">
      
      <template v-for="photo in photos" :key="photo.id" >
      <v-col v-if="photo.name != '.emptyFolderPlaceholder'" cols="4" align="center" class="d-flex child-flex">
        <v-img
            :lazy-src="photo.url"
            :src="photo.url"
            aspect-ratio="1"
            class="bg-grey-lighten-2"
            cover>
        </v-img>
      </v-col>
    </template>
    </v-row>
</template>

<style scoped>
</style>
