import slugify from 'slugify'

const generateId = {
  methods: {
    generateId(text) {
      return slugify(text, {
        lower: true
      })
    }
  }
}

export default generateId
