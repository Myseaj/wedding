<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { supabase } from './lib/supabaseClient'

let photos = ref([])
let loading = ref(false)
let fileInput = ref(null)

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

      if (error) {
        console.error(error)
      }
      await supabase
      .from('photos')
      .insert({
        uploader: null,
        name: file.name,
        public_url: url.data.publicUrl
      })
  }
  
  await listFiles()
  showFiles(photoObject.value.page)
  fileInput.value = null
  loading.value = false
}

const openFile = async(photo) => {
  window.open(photo.public_url)
}

const listFiles = async () => {
  photoObject.value = {
  length: 1,
  page: 1,
  photosPerPage: 6,
  photoItems:[]
}
  const { data, error } = await supabase
    .from('photos')
    .select("*")
  if (error) {
    console.error(error)
  } else {
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
  <v-row align="center" justify="center" class="my-4">
    <v-col cols="12">
        <div class="text-h5 font-italic" >Hochzeitsfotos Joanna & Matthias</div>
    </v-col>
    <v-col align="center" cols="12">
      <v-card class="mx-4" elevation="5">
        <v-card-title class="bg-indigo">Bilder hochladen</v-card-title>
        <v-card-text class="mt-4">
          <v-row align="center" justify="center">
            <v-col cols="12" align="center" class="mr-10">
              <v-file-input v-model="fileInput" chips variant="outlined" label="Fotos hochladen" @change="uploadFile" multiple></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col align="center" cols="12">
      <v-card class="mx-4" :loading="loading"  elevation="5">
        <v-card-title class="bg-indigo mb-4">Galerie</v-card-title>
        <v-card-text>
          <v-col>
            <v-pagination @click="showFiles(photoObject.page)" size="small" v-model="photoObject.page" :length="photoObject.length" density="compact"></v-pagination>
          </v-col>
          
          <v-row align="center" justify="center">
            <v-col cols="12" v-if="loading" >
              <v-progress-linear indeterminate color="indigo" height="30"></v-progress-linear>
            </v-col>
            <template v-for="photo in photos" :key="photo.id" >
            <v-col v-if="photo.name != '.emptyFolderPlaceholder'" cols="4" align="center" class="d-flex child-flex">
              <v-img
                  style="cursor: pointer"
                  @click="openFile(photo)"
                  :lazy-src="photo.public_url"
                  :src="photo.public_url"
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

<style>
body {
  background-color: white; /* Change this to your desired background color */
}
</style>
