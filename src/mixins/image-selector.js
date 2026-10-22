 const imageSelector = {
  data: function() {
    return {
      current_page:  1,
      page_size: 12,
      available_images: []
    }
  },
  computed: {
    total_pages: function () {
      return Math.ceil(this.available_images.length / this.page_size);
    },
    current_page_images: function () {
      const page_index = this.current_page - 1;
      const start = page_index * this.page_size;
      const end  = start + this.page_size;
      return this.available_images.slice(start, end);
    }
  }
};

export default imageSelector;
