class HaScreenSaver {
    constructor() {
        this.timer = null
        this.time = 3
        this.index = 0
        this.list = []
        // 监听事件
        this.created()
    }

    // 创建DOM节点
    created() {
        const div = document.createElement('div')
        const style = {
            width: '100%',
            height: '100vh',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            transition: 'background 1s',
            position: 'fixed',
            display: 'none',
            left: 0,
            top: 0
        }
        Object.keys(style).forEach(key => {
            div.style[key] = style[key]
        })
        div.onclick = () => {
            this.quit()
        }
        document.body.appendChild(div)
        this.node = div
        // 日期后面加
    }

    // 添加信息
    add(list) {
        this.list = list
        this.index = 0
    }

    // 开始
    start() {
        if (this.timer) {
            this.quit()
        }
        this.index = 0
        this.next()
        this.node.style.display = 'block'
        this.timer = setInterval(() => {
            this.next()
        }, this.time * 1000)
    }

    // 退出
    quit() {
        clearInterval(this.timer)
        this.node.style.display = 'none'
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
            <button id="btnStart">启动屏保</button>
            <button id="btnUpdate">更新数据</button>
            <button id="btnFullScreen">全屏</button>
            <button id="btnExitFullScreen">退出全屏</button>
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
        let { _config, $ } = this
        // 定义事件
        $('#btnStart').onclick = () => {
            window.HA_SCREEN_SAVER.add(this._config.list)
            window.HA_SCREEN_SAVER.start()
        }

        $('#btnUpdate').onclick = () => {
            window.HA_SCREEN_SAVER.add(this._config.list)
            this.toast("更新成功")
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