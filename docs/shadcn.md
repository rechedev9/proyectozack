---
summary: 'shadcn/ui CLI v4 — init, add, and usage for Dialog, Form, Tabs, Badge, Button, Table, Input, Textarea, Select.'
read_when:
  - Adding or using shadcn/ui components
  - Building admin panel UI
  - Working with forms and modals
---

# shadcn/ui CLI v4 Reference

## Install & Init

```bash
npx shadcn@latest init -t next
# Prompts: style (neutral), CSS variables (yes), Tailwind config path
```

## Add Components

```bash
npx shadcn@latest add button dialog form tabs badge table input textarea select
```

Components are copied to `src/components/ui/`. You own the code — edit freely.

## Import Paths

```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
```

## Button

```typescript
<Button variant="default" | "secondary" | "outline" | "ghost" | "destructive" size="default" | "sm" | "lg" | "icon">
  Label
</Button>
```

## Dialog (Modal)

```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Form (with react-hook-form + zod)

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'

const schema = z.object({ name: z.string().min(1), message: z.string().min(10) })
type FormData = z.infer<typeof schema>

export function ContactForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Send
        </Button>
      </form>
    </Form>
  )
}
```

## Tabs

```typescript
<Tabs defaultValue="brands">
  <TabsList>
    <TabsTrigger value="brands">For Brands</TabsTrigger>
    <TabsTrigger value="creators">For Creators</TabsTrigger>
  </TabsList>
  <TabsContent value="brands">Brands content</TabsContent>
  <TabsContent value="creators">Creators content</TabsContent>
</Tabs>
```

## Badge

```typescript
<Badge variant="default" | "secondary" | "outline" | "destructive">Active</Badge>
```

## Table

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell><Badge>{row.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Input

```typescript
<Input type="text" | "email" | "password" placeholder="..." className="..." {...field} />
```

## Textarea

```typescript
<Textarea placeholder="Enter message..." rows={4} {...field} />
```

## Select

```typescript
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select platform" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="twitch">Twitch</SelectItem>
    <SelectItem value="youtube">YouTube</SelectItem>
    <SelectItem value="cs2">CS2</SelectItem>
  </SelectContent>
</Select>
```

With react-hook-form:
```typescript
<FormField
  control={form.control}
  name="platform"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Platform</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger><SelectValue /></SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="twitch">Twitch</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```
