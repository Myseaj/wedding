<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { supabase } from './lib/supabaseClient'

let photos = ref([])
let loading = ref(false)

let photoObject = ref({
  length: 1,
  page: 1,
  photosPerPage: 6,
  photoItems:[]
})

const uploadFile = async (event) => {
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
  loading.value = false
  await listFiles()
}

const openFile = async(photo) => {
  window.open(photo.url)
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
      const url = supabase.storage.from('photos_public').getPublicUrl(photo.name)
      photo.url = url.data.publicUrl
    })
  }
  var index = null;
  for (var i = 0 ; i < data.length ; i++) {
    if (!index) {
      index = 1
    }
    if (photoObject.value.photoItems[index - 1] === undefined) {
      photoObject.value.photoItems[index - 1] = []
    }
    if (photoObject.value.photoItems[index-1].length < photoObject.value.photosPerPage) {
      if (data[i].name !== '.emptyFolderPlaceholder') {
        photoObject.value.photoItems[index-1].push(data[i])
      }
      
    } else {
      index++
    }
  }

  photoObject.value.length = Math.ceil(data.length / photoObject.value.photosPerPage)
}

const showFiles = async (page) => {
  photoObject.value.page = page
  photos.value = photoObject.value.photoItems[page - 1]
}

onMounted(async () => {
  loading.value = true
  await listFiles()
  showFiles(1)
  loading.value = false
})

</script>

<template>
  <v-row align="center" justify="center" class="ma-4">
    <v-col align="center" cols="12">
      <v-card class="mx-4">
        <v-card-title class="bg-indigo">Bilder hochladen</v-card-title>
        <v-card-text class="mt-4">
          <v-file-input chips variant="outlined" label="Fotos hochladen" @change="uploadFile" multiple></v-file-input>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col align="center" cols="12">
      <v-card class="mx-4" :loading="loading">
        <v-card-title class="bg-indigo mb-4">Galerie</v-card-title>
        <v-card-text>
          <v-pagination @click="showFiles(photoObject.page)" size="small" v-model="photoObject.page" :length="photoObject.length" density="compact"></v-pagination>
          <v-row align="center" justify="center" class="mx-4">
      
            <template v-for="photo in photos" :key="photo.id" >
            <v-col v-if="photo.name != '.emptyFolderPlaceholder'" cols="4" align="center" class="d-flex child-flex">
              <v-img
                  @click="openFile(photo)"
                  :lazy-src="photo.url"
                  :src="photo.url"
                  aspect-ratio="1"
                  class="bg-grey-lighten-2"
                  cover>
              </v-img>
            </v-col>
          </template>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  
    
    
  </v-row>
</template>

<style scoped>
</style>
