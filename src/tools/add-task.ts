import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

const nonEmptyString = z.string().transform((str) => (str.trim() === '' ? undefined : str))
const transformToUndefined = <T>(v: T) => (v ? v : undefined)

export function registerAddTask(server: McpServer, api: TodoistApi) {
    server.tool(
        'add-task',
        'Add a task to Todoist',
        {
            content: z.string(),
            description: nonEmptyString.optional().nullable().transform(transformToUndefined),
            projectId: nonEmptyString
                .optional()
                .nullable()
                .transform(transformToUndefined)
                .describe('The ID of a project to add the task to'),
            assigneeId: nonEmptyString
                .optional()
                .nullable()
                .transform(transformToUndefined)
                .describe('The ID of a project collaborator to assign the task to'),
            priority: z
                .number()
                .min(1)
                .max(4)
                .optional()
                .nullable()
                .transform(transformToUndefined)
                .describe('Task priority from 1 (normal) to 4 (urgent)'),
            labels: z.array(z.string()).optional().nullable().transform(transformToUndefined),
            parentId: nonEmptyString
                .optional()
                .nullable()
                .transform(transformToUndefined)
                .describe('The ID of a parent task if you want to add the task as a subtask'),
            deadlineDate: nonEmptyString
                .optional()
                .nullable()
                .transform(transformToUndefined)
                .describe("Specific date in YYYY-MM-DD format relative to user's timezone."),
            deadlineLang: nonEmptyString
                .optional()
                .nullable()
                .transform(transformToUndefined)
                .describe('2-letter code specifying language of deadline.'),
        },
        async ({
            content,
            description,
            projectId,
            parentId,
            assigneeId,
            priority,
            labels,
            deadlineDate,
            deadlineLang,
        }) => {
            const task = await api.addTask({
                content,
                description,
                projectId,
                parentId,
                assigneeId,
                priority,
                labels,
                deadlineDate,
                deadlineLang,
            })
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(task, null, 2),
                    },
                ],
            }
        },
    )
}
