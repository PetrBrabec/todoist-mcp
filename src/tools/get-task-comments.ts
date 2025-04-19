import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

export function registerGetTaskComments(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-task-comments',
        'Get comments from a task in Todoist',
        { taskId: z.string() },
        async ({ taskId }) => {
            let response = await api.getComments({ taskId })
            const comments = response.results
            while (response.nextCursor) {
                response = await api.getComments({ taskId, cursor: response.nextCursor })
                comments.push(...response.results)
            }

            if (comments.length === 0) {
                return {
                    content: [{ type: 'text', text: 'No comments found for this task' }],
                }
            }

            return {
                content: comments.map((comment) => ({
                    type: 'text',
                    text: JSON.stringify(comment, null, 2),
                })),
            }
        },
    )
}
