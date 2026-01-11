"use client"
import { Link } from "react-router-dom"
import { FileQuestion, Trophy, Code2, ArrowRight, Zap, Users } from "lucide-react"
import { Button } from "./ui/button"
function Home() {

return (
  <div className="min-h-screen bg-background transition-colors duration-300">
    {/* Hero Section */}
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40 -top-40 -left-40 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-40 -bottom-40 -right-40 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-40 top-1/2 left-1/2 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-down">
          <span className="text-foreground">Build. Compete. </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            Excel.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in-up delay-100">
          Create coding challenges, host contests, and sharpen your programming skills in a competitive environment.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-200">
          <div className="group bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary transition-all duration-500 hover:shadow-xl hover:shadow-primary/10">
            <div className="w-14 h-14 bg-primary/15 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileQuestion className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Create Questions
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Design challenging problems to test programming skills
            </p>
          </div>

          <div className="group bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-accent transition-all duration-500 hover:shadow-xl hover:shadow-accent/10">
            <div className="w-14 h-14 bg-accent/15 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Host Contests
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Organize competitive coding events and track performance
            </p>
          </div>

          <div className="group bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-secondary transition-all duration-500 hover:shadow-xl hover:shadow-secondary/10">
            <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Code2 className="w-7 h-7 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Browse Questions
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Explore a vast collection of coding challenges
            </p>
          </div>
        </div>

        {/* CTA Buttons (UNCHANGED STRUCTURE + ANIMATION) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
          <Link
            to="/create-question"
            className="group px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/40 inline-flex items-center gap-2"
          >
            Create Question
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <Link
            to="/show-all-questions"
            className="group px-8 py-4 bg-muted hover:bg-muted/80 border-2 border-border text-foreground rounded-xl text-lg font-semibold transition-all duration-300 inline-flex items-center gap-2"
          >
            Browse Questions
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in-up delay-400">
          <div className="p-6 rounded-xl bg-card/90 backdrop-blur-sm border border-border hover:border-border/70 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <div className="text-4xl font-bold text-primary">500+</div>
            </div>
            <div className="text-muted-foreground font-medium">Questions</div>
          </div>

          <div className="p-6 rounded-xl bg-card/90 backdrop-blur-sm border border-border hover:border-border/70 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <div className="text-4xl font-bold text-accent">100+</div>
            </div>
            <div className="text-muted-foreground font-medium">Contests</div>
          </div>

          <div className="p-6 rounded-xl bg-card/90 backdrop-blur-sm border border-border hover:border-border/70 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-secondary-foreground" />
              <div className="text-4xl font-bold text-secondary-foreground">1K+</div>
            </div>
            <div className="text-muted-foreground font-medium">Users</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)



}

export default Home
