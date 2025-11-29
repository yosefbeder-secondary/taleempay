'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { searchStudents } from '@/app/actions'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Student = {
  id: string
  name: string
  settingId: string
  classId: number
}

interface StudentSelectorProps {
  selectedStudent: Student | null
  onSelect: (student: Student) => void
  onClear: () => void
}

export function StudentSelector({ selectedStudent, onSelect, onClear }: StudentSelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])

  // Search students when query changes
  useEffect(() => {
    if (query.length >= 3) {
      searchStudents(query).then(setStudents)
    } else {
      setStudents([])
    }
  }, [query])

  if (selectedStudent) {
    return (
      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10" dir="rtl">
        <div className="text-right">
          <p className="font-medium text-gray-900">{selectedStudent.name}</p>
          <p className="text-sm text-gray-500">الفرقة {selectedStudent.classId} • {selectedStudent.settingId}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClear}
          className="text-gray-500 hover:text-red-600"
        >
          تغيير
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full" dir="rtl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 text-lg"
          >
            {selectedStudent ? (selectedStudent as Student).name : "ابحث عن اسمك..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="w-full">
            <CommandInput placeholder="ابحث عن اسمك..." onValueChange={setQuery} className="text-right" />
            <CommandList>
              <CommandEmpty>لا يوجد نتائج.</CommandEmpty>
              <CommandGroup>
                {students.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.name}
                    onSelect={() => {
                      onSelect(student)
                      setOpen(false)
                    }}
                    className="text-right flex flex-row-reverse justify-between"
                  >
                    <div className="flex flex-col items-end w-full">
                      <span>{student.name}</span>
                      <span className="text-xs text-muted-foreground">الفرقة {student.classId} • {student.settingId}</span>
                    </div>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
