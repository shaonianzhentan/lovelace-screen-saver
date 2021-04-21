class HaScreenSaver {
    constructor() {
        this.timer = null
        this.index = 0
        this.list = []
        // 监听事件
        this.created()
        this.autoTimer = null
    }

    autoStart(timeout) {
        this.timeout = timeout
        // 鼠标停止移动时，自动进入屏保
        if (!this.autoTimer) {
            const timeoutEvent = () => {
                if (this.autoTimer) {
                    clearTimeout(this.autoTimer)
                }
                this.autoTimer = setTimeout(() => {
                    if (!this.timer) {
                        console.log("启动服务", new Date().toLocaleString())
                        this.start()
                    }
                }, 1000 * this.timeout)
            }
            document.addEventListener('mousemove', timeoutEvent)
            timeoutEvent()
            // 启动定时器
            const week = ['日', '一', '二', '三', '四', '五', '六']
            let isTick = false
            setInterval(() => {
                let today = new Date()
                this.node.querySelector('.lovelace-screen-saver-today h1').innerHTML = `${today.getHours()}<b>${isTick ? ':' : ''}</b>${today.getMinutes()}`
                this.node.querySelector('.lovelace-screen-saver-today h3').innerHTML = `${today.getMonth() + 1}月${today.getDate()}日，星期${week[today.getDay()]}`
                isTick = !isTick
            }, 1000);
        }
    }

    // 创建DOM节点
    created() {
        const div = document.createElement('div')
        div.classList.add('lovelace-screen-saver')
        // 日期
        div.innerHTML = `<div class="lovelace-screen-saver-today">
                <h1></h1>
                <h3></h3>
            </div>`
        div.onclick = () => {
            this.quit()
        }
        document.body.appendChild(div)
        this.node = div
        // 全局样式
        const style = document.createElement('style')
        style.innerHTML = `
            .lovelace-screen-saver {
                width: 100%; height: 100vh;
                background-size: cover;
                background-repeat: no-repeat;
                background-color:black;
                transition: background 1s;
                position: fixed;
                display: none;
                left: 0;
                top: 0;
            }
            
            .lovelace-screen-saver-today {
                position: fixed;
                left: 10%;
                bottom: 5%;
                z-index: 10000;
                color: white;
            }    

            .lovelace-screen-saver-today h1 {
                font-size: 60px;
                margin: 0;
            }

            .lovelace-screen-saver-today b{display:inline-block;width:20px;text-align:center;}

            .lovelace-screen-saver-today h3 {
                font-size: 30px;
                margin: 0;
            }
        `
        document.head.appendChild(style)


    }

    // 添加信息
    add(list) {
        this.list = list
        this.index = 0
    }

    // 开始
    start(time) {
        if (this.timer) {
            this.quit()
        }
        if (time) {
            this.time = time
        } else {
            time = this.time
        }
        this.index = 0
        this.next()
        this.node.style.display = 'block'
        this.timer = setInterval(() => {
            this.next()
        }, time * 1000)
    }

    // 退出
    quit() {
        clearInterval(this.timer)
        this.node.style.display = 'none'
        this.timer = null
    }

    // 下一张
    next() {
        this.updated()
        let { index, list } = this
        index += 1
        if (index >= list.length) index = 0
        this.index = index
    }

    // 更新
    updated() {
        let { index, list } = this
        if (list.length > 0) {
            this.node.style.backgroundImage = `url(${list[index].url})`;
        }
    }
}

window.HA_SCREEN_SAVER = new HaScreenSaver()

class LovelaceScreenSaver extends HTMLElement {

    // 自定义默认配置
    static getStubConfig() {
        return {
            time: 5,
            timeout: 30,
            list: [
                {
                    url: 'https://cdn.jsdelivr.net/gh/shaonianzhentan/lovelace-screen-saver@main/test1.jpeg'
                },
                {
                    url: 'https://cdn.jsdelivr.net/gh/shaonianzhentan/lovelace-screen-saver@main/test2.jpeg'
                }
            ]
        }
    }

    /*
     * 设置配置信息
     */
    setConfig(config) {
        if (!Array.isArray(config.list) || config.list.length === 0) {
            throw new Error('你需要定义一个图片列表');
        }
        this._config = config;
    }

    // 卡片的高度(1 = 50px)
    getCardSize() {
        return 3;
    }

    /*
     * 接收HA核心对象
     */
    set hass(hass) {
        this._hass = hass
        if (this.isCreated === true) {
            this.updated(hass)
        } else {
            this.created(hass)
        }
    }

    // 创建界面
    created(hass) {

        /* ***************** 基础代码 ***************** */
        const shadow = this.attachShadow({ mode: 'open' });
        // 创建面板
        const ha_card = document.createElement('ha-card');
        ha_card.className = 'custom-card-panel'
        ha_card.innerHTML = `
            <button id="btnStart">
                <ha-icon icon="mdi:monitor-screenshot"></ha-icon>
                启动屏保
            </button>
            <button id="btnFullScreen">
                <ha-icon icon="mdi:fullscreen"></ha-icon>              
                全屏
            </button>
            <button id="btnExitFullScreen">
                <ha-icon icon="mdi:fullscreen-exit"></ha-icon>
                退出全屏
            </button>
            <div class="today"></div>
        `
        shadow.appendChild(ha_card)
        // 创建样式
        const style = document.createElement('style')
        style.textContent = `
            .custom-card-panel{ padding:10px; }            
        `
        shadow.appendChild(style);
        // 保存核心DOM对象
        this.shadow = shadow
        this.$ = this.shadow.querySelector.bind(this.shadow)
        // 创建成功
        this.isCreated = true

        /* ***************** 附加代码 ***************** */
        let { $ } = this
        // 定义事件
        $('#btnStart').onclick = () => {
            let { list, timeout, time } = this._config
            window.HA_SCREEN_SAVER.add(list)
            // 默认5秒
            if (/^\d+$/.test(time) === false || time < 5) {
                time = 5
            }
            window.HA_SCREEN_SAVER.start(time)
            // 默认30秒
            if (/^\d+$/.test(timeout) === false || timeout < 30) {
                timeout = 30
            }
            window.HA_SCREEN_SAVER.autoStart(timeout)
        }
        $('#btnFullScreen').onclick = () => {
            document.documentElement.requestFullscreen()
        }
        $('#btnExitFullScreen').onclick = () => {
            document.exitFullscreen()
        }
    }

    // 更新界面数据
    updated(hass) {
        let { $, _config } = this
    }
}

if (!customElements.get('lovelace-screen-saver')) customElements.define('lovelace-screen-saver', LovelaceScreenSaver);
// 添加预览
window.customCards = window.customCards || [];
window.customCards.push({
    type: "lovelace-screen-saver",
    name: "屏保",
    preview: true,
    description: "屏幕保护程序"
});