import { visit } from 'unist-util-visit'

export function remarkCustomBlocks() {
    return (tree) => {
        visit(tree, 'paragraph', (node, index, parent) => {
            const { children } = node

            // 检查是否包含 info block
            let isInfoBlock = false
            let content = ''
            let collectContent = false

            // 遍历所有子节点，收集内容
            for (let i = 0; i < children.length; i++) {
                const child = children[i]

                if (child.type === 'text') {
                    if (child.value.includes(':::info')) {
                        isInfoBlock = true
                        collectContent = true
                        // 获取 :::info 后面的内容
                        const startContent = child.value.split(':::info')[1]
                        if (startContent) {
                            content += startContent
                        }
                    } else if (child.value.includes(':::')) {
                        // 不添加包含结束标记的文本
                        collectContent = false
                        continue
                    } else if (collectContent) {
                        content += child.value
                    }
                } else if (child.type === 'link' && collectContent) {
                    // 处理链接，转换为 HTML a 标签
                    content += `<a href="${child.url}" class="text-blue-500 no-underline hover:underline">${child.children[0].value}</a>`
                }
            }

            if (isInfoBlock) {
                // 创建新的 HTML 节点，确保结构与样式定义匹配
                const newNode = {
                    type: 'html',
                    value: `<div class="custom-block info">
                        <p>${content.trim()}</p>
                    </div> <br>`
                }

                // 替换原始节点
                parent.children.splice(index, 1, newNode)
            }
        })
    }
} 