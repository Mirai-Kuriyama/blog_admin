import { Modal } from 'view-design'

const beforeClose = {
  before_close_normal: (resolve) => {
    Modal.confirm({
      title: '关闭后,页面将重置,请确保已保存内容!',
      okText: '确认关闭',
      cancelText: '留在此页',
      onOk: () => {
        resolve(true)
      },
      onCancel: () => {
        resolve(false)
      }
    })
  }
}

export default beforeClose
