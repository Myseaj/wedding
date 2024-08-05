<template>
  <v-row align="center" justify="center" class="my-4">
    <v-col align="center" cols="12">
      <v-card flat class="mb-2">
        <v-row justify="center">
          <v-col justify="center">
            <v-img height="80" cover gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)" src="https://png.pngtree.com/thumb_back/fh260/background/20230408/pngtree-happy-wedding-background-image_2138394.jpg">
              <div class="pa-2 wedding-title text-white">Hochzeitsfotos & Photoquest Joanna & Matthias</div></v-img>
          </v-col>
        </v-row>
      </v-card>
      
      <v-card class="mb-4" elevation="5">
        <v-card-title class="bg-indigo">Aufgaben</v-card-title>
        <v-card-text class="ma-4">
          <div class="text-caption">Mach bei unserer Photoquest mit oder lade Bilder einfach so hoch!</div>
          <template v-for="task in tasks">
            <li style="font-size:6pt" v-if="task.id > 0">{{ task.task }}</li>
          </template>
        </v-card-text>
      </v-card>
      <v-card class="mb-4" elevation="5">
        <v-card-title class="bg-indigo">Bilder hochladen</v-card-title>
        <v-card-text class="mt-4">
          <v-row align="center" justify="center">
            <v-col cols="12">
              <v-select density="compact" v-model="selectedTask" item-title="short"  item-value="short" :items="tasks" label="Aufgabe" variant="outlined"></v-select>
              <v-text-field density="compact" variant="outlined" v-model="uploader" label="Dein Name"></v-text-field>
              <v-file-input prepend-icon="mdi-camera" density="compact" v-model="fileInput" chips variant="outlined" label="Fotos hochladen" @change="uploadFile" multiple></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card  :loading="loading"  elevation="5">
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
                <v-card flat style="font-size:5pt">
                  {{ photo.uploader ? photo.uploader : "Unbekannt" }}: {{ photo.task ? photo.task : "Allgemein" }}
                  <v-img
                    style="cursor: pointer"
                    @click="openFile(photo)"
                    :lazy-src="photo.public_url"
                    :src="photo.public_url"
                    aspect-ratio="1"
                    class="bg-grey-lighten-2"
                    cover>
                  </v-img>
                </v-card>
              </v-col>
          </template>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  
    
    
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { supabase } from './lib/supabaseClient'

let photos = ref([])
let loading = ref(false)
let fileInput = ref(null)

const tasks = [
  {id:"0",short:"Allgemein",task:"Allgemein"},
  {id:"1",short:"Foto mit allen vom Tisch",task:"Mach ein Foto mit allen Personen an deinem Tisch"},
  {id:"2",short:"Fotos mit Bekannten",task:"Mach ein Foto mit allen Gästen, die du schon vor der Hochzeit kanntest"},
  {id:"3",short:"Foto mit der ähnlichsten Person",task:"Mach ein Bild mit der Person auf der Hochzeit, die dir am ähnlichsten sieht"},
  {id:"4",short:"Foto mit ältester Person",task:"Mach ein Foto mit dem ältesten Gast auf der Hochzeit."},
  {id:"5",short:"Foto mit jüngster Person",task:"Mach ein Foto mit dem jüngsten Gast auf der Hochzeit."},
  {id:"6",short:"Foto mit weitgereister Person",task:"Mach ein Foto mit dem Brautpaar und einem Gast, der am weitesten gereist ist."},
  {id:"7",short:"Foto mit Hochzeitsdebütant",task:"Finde einen Gast, der noch nie auf einer Hochzeit war, und macht ein Foto zusammen."},
  {id:"8",short:"Foto mit gleichen Hobbys",task:"Mach ein Foto mit einem Gast, der das gleiche Hobby wie du hat."},
]

let photoObject = ref({
  length: 1,
  page: 1,
  photosPerPage: 6,
  photoItems:[],
})

let selectedTask = ref(tasks[0].short)
let uploader = ref(null)

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
        uploader: uploader.value,
        task: selectedTask.value,
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

<style>
.wedding-title {
  font-size: 1.3rem;
  font-weight: 400;
  color:"black";
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
}
</style>
