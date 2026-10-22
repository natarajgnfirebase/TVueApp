
import { Quill } from 'vue2-editor'

const Link = Quill.import('formats/link')

class TargetedLink extends Link {
  static create(value) {
    let node = super.create(value)
    value = this.sanitize(value)
    node.setAttribute('href', value)
    if (value.startsWith('#')) {
      node.removeAttribute('target')
      node.removeAttribute('rel')
    }
    return node
  }
}

export default TargetedLink
