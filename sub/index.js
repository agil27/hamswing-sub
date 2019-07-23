let sharedCanvas = null
let context = null
let heightPerUser = 80
let widthPerUser = 700

/*
wx.onMessage((data) => {
    console.log('我画了')

    if (sharedCanvas === null) {
        sharedCanvas = wx.getSharedCanvas();
    }
    if (context === null) {
        context = sharedCanvas.getContext('2d')
    }

    console.log('子域获取的canvas', sharedCanvas)
    //context.clearRect(0, 0, widthPerUser, heightPerUser * 10)
    context.font = '48px Verdana'
    context.fillStyle = '#000000'
    context.fillText('HELLOWORLD', 20, 58)
})
*/

//console.log('子域代码执行中...')

wx.onMessage((data) => {
    if (data.message === 'score') {
        wx.getUserCloudStorage({
            keyList: ['score'],
            success : (res) => {
                //console.log(res)
                //console.log(data.number)
                //console.log(parseInt(res.KVDataList[0]['value']))
                if (res.KVDataList === null || res.KVDataList.length < 1 || data.number > parseInt(res.KVDataList[0]['value'])) {
                    //console.log('准备更新用户最高分...')
                    wx.setUserCloudStorage({
                        KVDataList: [{
                            key : 'score',
                            value : '' + data.number
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
            fail : (res) => {
                console.log('上传用户分数失败')
            }
        })
    } else {
        console.log('正在渲染中...')
        if (sharedCanvas === null) {
            sharedCanvas = wx.getSharedCanvas();
        }
        if (context === null) {
            context = sharedCanvas.getContext('2d')
        }
    
        context.clearRect(0, 0, widthPerUser, heightPerUser * 10)
    
        wx.getUserCloudStorage({
            keyList: ['score'],
    
            success: (res) => {
                console.log('获得的用户信息为 ', res)
                wx.getFriendCloudStorage({
                    keyList: ['score'],
                    success: (res) => {
                        //console.log('获得的用户好友信息为 ', res)
                        drawRankList(res)
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

function drawRankList(res) {
    console.log('准备绘制的用户好友信息为 ', res)
    if (res === null || res.data === null || res.data.length === null || res.data.length < 1) {
        console.log('好友信息不正确')
        return
    }

    //存储好友数据
    let rankInfo = []
    let data = res.data
    for (let i in data) {
        let userBlock = {}
        userBlock.score = data[i].KVDataList[0]['value']
        userBlock.nickname = data[i].nickname
        userBlock.avatar = data[i].avatarUrl
        userBlock.rank = 0
        userBlock.isUser = false
        //console.log('准备存储的user block为 ', userBlock)
        rankInfo.push(userBlock)
    }

    let rankLength = rankInfo.length

    //console.log('用户数量：' + rankLength)

    //排序
    rankInfo.sort((a, b) => {
        let scoreA = parseInt(m.score)
        let scoreB = parseInt(n.score)

        if (typeof scoreA !== 'number' || scoreA === NaN) {
            scoreA = -1
        }

        if (typeof scoreB !== 'number' || scoreB === NaN) {
            scoreB = -1
        }

        if (scoreA > scoreB) {
            return -1
        } else if (scoreA < scoreB) {
            return 1
        } else {
            if (m.nickname > n.nickname) {
                return 1
            } else if (m.nickname < n.nickname) {
                return -1
            }
            return 0
        }
    })

    for (let i = 0; i < rankLength; i++) {
        rankInfo[i].rank = i + 1
    }

    console.log('排行榜信息为 ', rankInfo)
    //绘制
    draw(rankInfo, rankLength)
}

function draw(rankInfo, rankLength) {
    for (let i = 0; i < rankLength; i++) {
        let rankItem = rankInfo[i]
        let y = i * heightPerUser
        console.log('作画区域为 ', context)
        context.textAlign = 'left'
        
        let nickname = rankItem.nickname
        let score = rankItem.score
        let avatar = rankItem.avatar + '?aaa=aa.jpg'
        let rank = '' + rankItem.rank

        context.font = '36px Verdana'

        if (i % 2 == 0) {
            context.fillStyle = '#000000'
        } else {
            context.fillStyle = '#ffffff'
        }

        context.fillText(rank, 50, y + 50)
        context.font = '32px Calibri'
        //context.fillStyle = '#000000'
        context.fillText(score, 600, y + 50)
        
        //context.fillStyle = '#000000'
        context.font = '24px Verdana'
        context.fillText(nickname, 230, y + 50)

        let img = wx.createImage()
        img.src = avatar
        img.onload = (res) => {
            let imgHeight = 60
            let imgWidth = 60
            context.drawImage(img, 130, y + 10, imgWidth, imgHeight);
        }
        //console.log('画的图片是 ', img)
        
        for (let j = 0; j < 5; j++) {
            let y = j * heightPerUser
            if (j % 2 == 1) {
                context.fillStyle = "#dd8843"
                context.fillRect(5, y, widthPerUser, heightPerUser)
            }
        }
        
        //console.log('结束的画布为 ', context)
    }
}