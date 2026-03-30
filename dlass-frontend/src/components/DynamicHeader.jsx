import React, { useState, useEffect } from 'react';

const MESSAGES = {
  'provider-dashboard': [
    "Hey {name}, here are your appointments",
    "{name}, want to add a new service?",
    "{name}, when are you available?",
    "{name}, here's your performance",
    "Hey {name}, ready for today?",
    "{name}, let's check your progress",
    "Welcome back {name}"
  ],
  'search': [
    "Find the best services near you, {name}",
    "What are you looking for today, {name}?",
    "{name}, explore top-rated providers"
  ],
  'booking': [
    "Almost there {name}! Book your slot",
    "Secure your appointment, {name}",
    "Let's get this booked, {name}"
  ],
  'user-dashboard': [
    "Welcome back {name}",
    "Hey {name}, here are your bookings",
    "{name}, ready for your next appointment?"
  ],
  'default': [
    "Hello {name}!",
    "Welcome, {name}"
  ]
};

export default function DynamicHeader({ userName, context }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const list = MESSAGES[context] || MESSAGES['default'];
    let text = list[Math.floor(Math.random() * list.length)];
    const nameToUse = userName ? userName.split(' ')[0] : "Guest";
    text = text.replace('{name}', nameToUse);
    setGreeting(text);
  }, [userName, context]);

  return (
    <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
      {greeting}
    </h1>
  );
}
