// 定义画布的基本参数
let sharedCanvas = null
let context = null
let heightPerUser = 80
let widthPerUser = 700

function min(a, b) {
  return a < b ? a : b
}

function max(a, b) {
  return a > b ? a : b
}

wx.onMessage((data) => {
  if (data.message === 'score') {
    // 设定最高分
    wx.getUserCloudStorage({
      keyList: ['score'],
      success: (res) => {
        if (res.KVDataList === null || res.KVDataList.length < 1 || data.number > parseInt(res.KVDataList[0]['value'])) {
          // 超过最高分或者该用户还没有分数
          wx.setUserCloudStorage({
            KVDataList: [{
              key: 'score',
              value: '' + data.number
            }],

            success: (res) => {
              console.log('成功更新用户信息')
            },

            fail: (res) => {
              console.log('更新用户信息失败')
            }
          })
        } else {
          console.log('未超过最高分，无需更新')
        }
      },
      fail: (res) => {
        console.log('上传用户分数失败')
      }
    })
  } else {
    let page = data.page
    console.log('正在渲染中...')
    if (sharedCanvas === null) {
      sharedCanvas = wx.getSharedCanvas()
    }
    if (context === null) {
      context = sharedCanvas.getContext('2d')
    }

    context.clearRect(0, 0, widthPerUser, heightPerUser * 5)

    wx.getUserCloudStorage({
      keyList: ['score'],

      success: (res) => {
        console.log('获得的用户信息为 ', res)
        wx.getFriendCloudStorage({
          keyList: ['score'],
          success: (res) => {
            drawRankList(res, page)
          },
          fail: (res) => {
            console.log('获取好友信息失败')
          }
        })
      },

      fail: (res) => {
        console.log('获取用户信息失败')
      }
    })
  }
})

function drawRankList (res, page) {
  console.log('准备绘制的用户好友信息为 ', res)
  if (res === null || res.data === null || res.data.length === null || res.data.length < 1) {
    console.log('好友信息不正确')
    return
  }

  // 重新组织、存储好友数据
  let rankInfo = []
  let data = res.data
  for (let i in data) {
    let userBlock = {}
    userBlock.score = data[i].KVDataList[0]['value']
    userBlock.nickname = data[i].nickname
    userBlock.avatar = data[i].avatarUrl
    userBlock.rank = 0
    userBlock.isUser = false
    rankInfo.push(userBlock)
  }

  let rankLength = rankInfo.length

  // 对好友信息进行排序
  rankInfo.sort((a, b) => {
    let scoreA = parseInt(a.score)
    let scoreB = parseInt(b.score)

    if (typeof scoreA !== 'number' || isNaN(scoreA)) {
      scoreA = -1
    }

    if (typeof scoreB !== 'number' || isNaN(scoreB)) {
      scoreB = -1
    }

    if (scoreA > scoreB) {
      return -1
    } else if (scoreA < scoreB) {
      return 1
    } else {
      if (a.nickname > b.nickname) {
        return 1
      } else if (a.nickname < b.nickname) {
        return -1
      }
      return 0
    }
  })

  for (let i = 0; i < rankLength; i++) {
    rankInfo[i].rank = i + 1
  }

  console.log('排行榜信息为 ', rankInfo)
  // 绘制
  draw(rankInfo, rankLength, page)
}

function draw (rankInfo, rankLength, page) {
  if (!page || page === undefined) {
    page = 0
  }
  let actualPage = min(page, Math.floor(max(0, (rankLength - 1)) / 5))
  console.log(actualPage)
  // 清空画布
  context.clearRect(0, 0, widthPerUser, heightPerUser * 5)
  // 绘制背景
  for (let j = 0; j < 5; j++) {
    let y = j * heightPerUser
    if (j % 2 == 1) {
      context.fillStyle = '#dd8843'
      context.fillRect(0, y, widthPerUser, heightPerUser)
    }
  }
  // 绘制信息
  for (let i = 5 * actualPage; i < min(5 * actualPage + 5, rankLength); i++) {
    let rankItem = rankInfo[i]
    let y = (i % 5) * heightPerUser
    context.textAlign = 'left'

    let nickname = rankItem.nickname
    let score = rankItem.score
    let avatar = rankItem.avatar + '?aaa=aa.jpg'
    let rank = '' + rankItem.rank

    context.font = '36px Verdana'

    // 根据背景颜色的深浅来决定绘制文字的颜色
    if (i % 5 === 0 || i % 5 === 2 || i % 5 === 4) {
      context.fillStyle = '#000000'
    } else {
      context.fillStyle = '#ffffff'
    }

    // 绘制排名、姓名、得分
    context.fillText(rank, 50, y + 50)
    context.font = '28px Calibri'
    context.fillText(score, 600, y + 50)

    context.font = '24px Verdana'
    context.fillText(nickname, 230, y + 50)

    // 绘制头像
    let img = wx.createImage()
    img.src = avatar
    img.onload = (res) => {
      let imgHeight = 60
      let imgWidth = 60
      context.drawImage(img, 130, y + 10, imgWidth, imgHeight)
    }
  }
}
