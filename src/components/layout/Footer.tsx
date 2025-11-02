import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Users, Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Facebook, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Browse Books', path: '/books' },
    { name: 'Get Started', path: '/register' },
    { name: 'Donation Impact', path: '/donation-history' },
  ];

  const communityStats = [
    { icon: Users, label: '1000+ Active Donors', color: 'text-primary' },
    { icon: BookOpen, label: '5000+ Books Donated', color: 'text-secondary' },
    { icon: Heart, label: '2500+ Students Helped', color: 'text-primary' },
  ];

  const contactInfo = [
    { icon: Mail, label: 'riya@gmail.com', href: null },
    { icon: Phone, label: '+91 9329497885', href: null },
    { icon: MapPin, label: 'Indore, India', href: null },
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Background gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-[#0B0F14]"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]"></div>

      {/* Decorative top border with glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center icon-glow shadow-[0_0_20px_rgba(0,210,106,0.3)]">
                <BookOpen className="w-6 h-6 text-background" />
              </div>
              <span className="text-2xl font-bold text-gradient">Gyan Tree</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting book donors with learners across India. Share knowledge, 
              spread education, and help build a learning community.
            </p>
            <div className="flex items-center gap-2 text-sm">
             
              <span className="text-muted-foreground">Empowering education through book sharing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground">Quick Links</h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200 group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground">Community</h3>
            <div className="space-y-4">
              {communityStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <stat.icon className={`w-4 h-4 ${stat.color} icon-glow`} />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground">Contact Us</h3>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <contact.icon className="w-4 h-4 text-primary icon-glow" />
                  </div>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {contact.label}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {contact.label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Social Media Icons */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Follow Us</h4>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg glass-card flex items-center justify-center group hover:border-primary/50 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary icon-glow transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider with glow */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm"></div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2025 Gyan Tree Project.</span>
            
            <span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
