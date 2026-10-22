const imageLookup = {
  methods: {
    imageByFile: function (file) {
      const image = this.available_images.find(img => img.file === file)
      console.log(`${file} → `, image)
      return image || {
        file,
        width: undefined,
        height: undefined
      }
    }
  }
}

export default imageLookup
