<template>
  <v-row align="center" justify="center" class="my-4">
    <v-col align="right" class="my-n8">
      <v-btn-toggle v-model="language" size="x-small">
        <v-btn value="de" @click="setLocalStorage('de')" size="x-small" color="green">Deutsch</v-btn>
        <v-btn value="pl" @click="setLocalStorage('pl')" color="green" size="x-small">Polski</v-btn>
      </v-btn-toggle>
    </v-col>
    <v-col align="center" cols="12">
      <v-card flat class="mb-2">
        
        <v-row justify="center">
          
          <v-col justify="center">
            <v-img height="80" cover gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)" src="https://png.pngtree.com/thumb_back/fh260/background/20230408/pngtree-happy-wedding-background-image_2138394.jpg">
                <div class="pa-2 wedding-title text-white">
                  <span v-if="language === 'de'">Hochzeitsfotoquest Joanna & Matthias</span>
                  <span v-else-if="language === 'pl'">Zadanie fotograficzne na ślub Joanny i Matthiasa</span>
                </div>
              </v-img>
          </v-col>
        </v-row>
      </v-card>
      
      <v-card class="mb-4" elevation="5">
        <v-card-title class="bg-indigo">
          <span v-if="language === 'de'">Aufgaben</span>
          <span v-else-if="language === 'pl'">Zadania</span>
        </v-card-title>
        <v-card-text class="ma-4">
          <div class="text-caption" v-if="language === 'de'">Mach bei unserer Photoquest mit oder lade Bilder einfach so hoch!</div>
          <div class="text-caption" v-else-if="language === 'pl'">Dołącz do naszej Photoquest lub po prostu załaduj zdjęcia!</div>
          <template v-for="task in tasks">
            <li style="font-size:6pt" v-if="task.id > 0">{{ language == 'de' ? task.task_de : task.task_pl }}</li>
          </template>
        </v-card-text>
      </v-card>
      <v-card class="mb-4" elevation="5">
        <v-card-title class="bg-indigo">
          <span v-if="language === 'de'">Bilder hochladen</span>
          <span v-else-if="language === 'pl'">Wgraj zdjęcia</span>
        </v-card-title>
        <v-card-text class="mt-4">
          <v-row align="center" justify="center">
            <v-col cols="12">
              <v-select density="compact" v-model="selectedTask" :item-title="language == 'de' ? 'short_de' : 'short_pl'"  item-value="short" :items="tasks" :label="language == 'de' ? 'Aufgabe' : 'Zadania'" variant="outlined"></v-select>
              <v-text-field @input="setName" density="compact" variant="outlined" v-model="uploader" :label="language == 'de' ? 'Dein Name' : 'Twoje imię'"></v-text-field>
              <v-file-input prepend-icon="mdi-camera" density="compact" v-model="fileInput" chips variant="outlined" :label="language == 'de' ? 'Fotos hochladen' : 'Przesyłać zdjęcia'" @change="uploadFile" multiple></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card  :loading="loading"  elevation="5">
        <v-card-title class="bg-indigo mb-4">
          {{ language == 'de' ? 'Galerie' : 'Galeria' }}
        </v-card-title>
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
let language = ref('de')

const tasks = [
  {id:"0",short_:"Allgemein",short_de:"Allgemein",short_pl:"Ogólny",task_de:"Allgemein",task_pl:"Ogólny"},
  {id:"1",short:"Foto mit allen vom Tisch",short_de:"Foto mit allen vom Tisch",short_pl:"Zdjęcie ze wszystkimi przy stole",task:"Mach ein Foto mit allen Personen an deinem Tisch",task_de:"Mach ein Foto mit allen Personen an deinem Tisch",task_pl:"Zrób zdjęcie ze wszystkimi osobami przy swoim stole"},
  {id:"2",short:"Fotos mit Bekannten",short_de:"Fotos mit Bekannten",short_pl:"Zdjęcia ze znajomymi",task:"Mach ein Foto mit allen Gästen, die du schon vor der Hochzeit kanntest",task_de:"Mach ein Foto mit allen Gästen, die du schon vor der Hochzeit kanntest",task_pl:"Zrób zdjęcie ze wszystkimi gośćmi, których znasz przed ślubem"},
  {id:"3",short:"Foto mit der ähnlichsten Person",short_de:"Foto mit der ähnlichsten Person",short_pl:"Zdjęcie z najpodobniejszą osobą",task:"Mach ein Bild mit der Person auf der Hochzeit, die dir am ähnlichsten sieht",task_de:"Mach ein Bild mit der Person auf der Hochzeit, die dir am ähnlichsten sieht",task_pl:"Zrób zdjęcie z osobą na weselu, która najbardziej ci przypomina"},
  {id:"4",short:"Foto mit ältester Person",short_de:"Foto mit ältester Person",short_pl:"Zdjęcie z najstarszą osobą",task:"Mach ein Foto mit dem ältesten Gast auf der Hochzeit.",task_de:"Mach ein Foto mit dem ältesten Gast auf der Hochzeit.",task_pl:"Zrób zdjęcie z najstarszym gościem na weselu."},
  {id:"5",short:"Foto mit jüngster Person",short_de:"Foto mit jüngster Person",short_pl:"Zdjęcie z najmłodszą osobą",task:"Mach ein Foto mit dem jüngsten Gast auf der Hochzeit.",task_de:"Mach ein Foto mit dem jüngsten Gast auf der Hochzeit.",task_pl:"Zrób zdjęcie z najmłodszym gościem na weselu."},
  {id:"6",short:"Foto mit weitgereister Person",short_de:"Foto mit weitgereister Person",short_pl:"Zdjęcie z osobą z najdalszej podróży",task:"Mach ein Foto mit  einem Gast, der am weitesten gereist ist.",task_de:"Mach ein Foto mit einem Gast, der am weitesten gereist ist.",task_pl:"Zrób zdjęcie z gościem, który przyjechał najdalej."},
  {id:"7",short:"Foto mit Hochzeitsdebütant",short_de:"Foto mit Hochzeitsdebütant",short_pl:"Zdjęcie z debiutantem weselnym",task:"Finde einen Gast, der noch nie auf einer Hochzeit war, und macht ein Foto zusammen.",task_de:"Finde einen Gast, der noch nie auf einer Hochzeit war, und macht ein Foto zusammen.",task_pl:"Znajdź gościa, który nigdy nie był na weselu, i zróbcie razem zdjęcie."},
  {id:"8",short:"Foto mit gleichen Hobbys",short_de:"Foto mit gleichen Hobbys",short_pl:"Zdjęcie z osobą o tych samych zainteresowaniach",task:"Mach ein Foto mit einem Gast, der das gleiche Hobby wie du hat.",task_de:"Mach ein Foto mit einem Gast, der das gleiche Hobby wie du hat.",task_pl:"Zrób zdjęcie z gościem, który ma takie samo hobby jak ty."}

]

let photoObject = ref({
  length: 1,
  page: 1,
  photosPerPage: 6,
  photoItems:[],
})

let selectedTask = ref(tasks[0].short)
let uploader = ref(null)


const setName = () => {
  localStorage.setItem('uploader',uploader.value)
}
const setLocalStorage = (lang) => {
  localStorage.setItem('language', lang)
  language.value = lang
}
const uploadFile = async (event) => {
  loading.value = true
  if (uploader.value) {
    localStorage.setItem('uploader', uploader.value)
  }
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
  if (localStorage.getItem('uploader')) {
    uploader.value = localStorage.getItem('uploader')
  }
  if (!localStorage.getItem('language')) {
    language.value = 'de'
  }
  else {
    language.value = localStorage.getItem('language')
  }
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
