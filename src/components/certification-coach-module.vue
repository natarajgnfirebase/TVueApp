<template>
  <div class="certification-coach-module">
    <div v-if="loading" class="hpe-spinner" />
    <div v-else-if="error" class="certification-coach-module__error">
      Sorry, there was a problem loading your recommendations. Please try again later.
    </div>
    <div v-else>
      <p>Based on your profile, we recommend the following certifications.</p>
      <ul class="certification-coach-module__recommendations">
        <li v-for="reco in recommendations" :key="reco" v-html="reco" />
      </ul>
      <a :href="progressUrl" class="certification-coach-module__progress" target="_blank">Check your progress</a>
    </div>    
  </div>
</template>

<script>
const axios = require('axios').default;

export default {
  name: 'certification-coach-module',
  data() {
    return {
      loading: true,
      error: false,
      recommendations: [],
      progressUrl: '',
    }
  },
  mounted() {
    const vm = this
    axios.post(`${this.api_endpoint}/GetCertificationCoach`, {}, {
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        const {
          result,
          recommendations,
          progressUrl,
        } = res?.data?.d

        if (result !== 'success') {
          vm.error = true
          vm.loading = false
          return
        }
        vm.recommendations = recommendations
        vm.progressUrl = progressUrl
        vm.loading = false
      })
      .catch((err) => {
        vm.loading = false
        vm.error = true
        console.log(err)
      })
  },
  computed: {
    api_endpoint() {
      let baseUrl = 'https://staging.mylearninghpe.com/techpro'
      if (typeof window.api_base_url !== 'undefined') {
        baseUrl = window.api_base_url;
      } else if (window.location.hostname === 'techpro.hpe.com') {
        baseUrl = 'https://techpro.hpe.com'
      }
      return `${baseUrl}/GeoPageAdminAPI.asmx`
    },
  }
}
</script>
