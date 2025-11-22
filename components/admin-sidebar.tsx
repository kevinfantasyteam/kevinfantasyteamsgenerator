"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Hash,
  Users,
  HelpCircle,
  Lightbulb,
  Shield,
  FileText,
  AlertTriangle,
  Mail,
  Youtube,
  Info,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function AdminSidebar({ className, ...props }: SidebarProps) {
  const menuItems = [
    {
      title: "Admin Accounts Data",
      icon: LayoutDashboard,
      href: "/admin", // mapped to existing route
      color: "text-blue-500",
    },
    {
      title: "Dream11 Hash",
      icon: Hash,
      href: "/hash-generation", // mapped to existing route
      color: "text-green-500",
    },
    {
      title: "Manage Group Info",
      icon: Users,
      href: "#",
      color: "text-purple-500",
    },
    {
      title: "How to generate?",
      icon: HelpCircle,
      href: "#",
      color: "text-yellow-500",
    },
    {
      title: "Best tips",
      icon: Lightbulb,
      href: "#",
      color: "text-orange-500",
    },
    {
      title: "Privacy Policy",
      icon: Shield,
      href: "#",
      color: "text-gray-500",
    },
    {
      title: "Terms And Conditions",
      icon: FileText,
      href: "#",
      color: "text-gray-500",
    },
    {
      title: "Disclaimer",
      icon: AlertTriangle,
      href: "#",
      color: "text-red-500",
    },
    {
      title: "Contact us",
      icon: Mail,
      href: "#",
      color: "text-blue-400",
    },
    {
      title: "Follow us on youtube",
      icon: Youtube,
      href: "https://www.youtube.com/c/believer01",
      color: "text-red-600",
      external: true,
    },
    {
      title: "About us",
      icon: Info,
      href: "#",
      color: "text-indigo-500",
    },
  ]

  return (
    <div className={cn("pb-12 w-64 border-r bg-white hidden md:block", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Menu</h2>
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  if (item.external) {
                    window.open(item.href, "_blank")
                  } else {
                    window.location.href = item.href
                  }
                }}
              >
                <item.icon className={cn("mr-2 h-4 w-4", item.color)} />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto p-4 border-t text-center text-sm text-gray-500">
        <small>developed by</small>
        <br />
        <a
          href="https://www.youtube.com/c/believer01"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium hover:underline"
        >
          Believer01
        </a>
      </div>
    </div>
  )
}
