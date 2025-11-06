from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from api.models import Skill, Profile, Session, Rating, Message


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Clear existing data (optional, comment out if you want to keep existing data)
        # Message.objects.all().delete()
        # Rating.objects.all().delete()
        # Session.objects.all().delete()
        # Profile.objects.all().delete()
        # User.objects.filter(is_superuser=False).delete()
        # Skill.objects.all().delete()
        
        # Create skills
        skills_data = [
            ('React', 'react'),
            ('Python', 'python'),
            ('Django', 'django'),
            ('JavaScript', 'javascript'),
            ('TypeScript', 'typescript'),
            ('Node.js', 'nodejs'),
            ('PostgreSQL', 'postgresql'),
            ('Docker', 'docker'),
            ('AWS', 'aws'),
            ('Git', 'git'),
        ]
        
        skills = {}
        for name, slug in skills_data:
            skill, created = Skill.objects.get_or_create(name=name, slug=slug)
            skills[name] = skill
            if created:
                self.stdout.write(f'Created skill: {name}')
        
        # Create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@skillsync.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write('Created admin user: admin / admin123')
        
        # Create regular users (learners)
        learners_data = [
            ('alice', 'alice@example.com', 'Alice', 'Johnson'),
            ('bob', 'bob@example.com', 'Bob', 'Smith'),
        ]
        
        learners = []
        for username, email, first, last in learners_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created learner: {username} / password123')
            learners.append(user)
        
        # Create mentor users
        mentors_data = [
            ('sarah_mentor', 'sarah@example.com', 'Sarah', 'Wilson', 
             'Full-stack developer with 5 years experience', 
             ['React', 'JavaScript', 'Node.js']),
            ('mike_mentor', 'mike@example.com', 'Mike', 'Brown',
             'Backend specialist focusing on Python and Django',
             ['Python', 'Django', 'PostgreSQL']),
            ('emma_mentor', 'emma@example.com', 'Emma', 'Davis',
             'DevOps engineer passionate about cloud infrastructure',
             ['Docker', 'AWS', 'Git']),
            ('john_mentor', 'john@example.com', 'John', 'Taylor',
             'Frontend expert with modern JavaScript frameworks',
             ['React', 'TypeScript', 'JavaScript']),
        ]
        
        mentors = []
        for username, email, first, last, bio, skill_names in mentors_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created mentor: {username} / password123')
            
            # Setup profile
            user.profile.is_mentor = True
            user.profile.bio = bio
            user.profile.availability = [
                {"day": 1, "start": "09:00", "end": "17:00"},
                {"day": 3, "start": "09:00", "end": "17:00"},
                {"day": 5, "start": "10:00", "end": "16:00"}
            ]
            user.profile.save()
            
            # Add skills
            for skill_name in skill_names:
                if skill_name in skills:
                    user.profile.skills.add(skills[skill_name])
            
            mentors.append(user)
        
        # Create sessions
        if learners and mentors:
            # Requested session
            session1 = Session.objects.create(
                requester=learners[0],
                mentor=mentors[0],
                skill=skills['React'],
                duration_minutes=30,
                description='Need help with React hooks and state management',
                status='requested',
                scheduled_time=timezone.now() + timedelta(days=2)
            )
            self.stdout.write('Created requested session')
            
            # Accepted session
            session2 = Session.objects.create(
                requester=learners[1],
                mentor=mentors[1],
                skill=skills['Django'],
                duration_minutes=45,
                description='Building REST API with Django',
                status='accepted',
                scheduled_time=timezone.now() + timedelta(days=1),
                meeting_url='https://zoom.us/j/12345678901'
            )
            self.stdout.write('Created accepted session')
            
            # Completed session with rating
            session3 = Session.objects.create(
                requester=learners[0],
                mentor=mentors[2],
                skill=skills['Docker'],
                duration_minutes=30,
                description='Docker containerization basics',
                status='completed',
                scheduled_time=timezone.now() - timedelta(days=3)
            )
            
            rating1 = Rating.objects.create(
                session=session3,
                rater=learners[0],
                score=5,
                comment='Excellent session! Very clear explanations.'
            )
            self.stdout.write('Created completed session with rating')
            
            # Another completed session with rating
            session4 = Session.objects.create(
                requester=learners[1],
                mentor=mentors[3],
                skill=skills['TypeScript'],
                duration_minutes=60,
                description='TypeScript advanced types',
                status='completed',
                scheduled_time=timezone.now() - timedelta(days=5)
            )
            
            rating2 = Rating.objects.create(
                session=session4,
                rater=learners[1],
                score=4,
                comment='Great session, learned a lot!'
            )
            self.stdout.write('Created another completed session with rating')
            
            # Mock messages
            Message.objects.create(
                session=session2,
                sender=learners[1],
                text='Hi! Looking forward to our session tomorrow.'
            )
            Message.objects.create(
                session=session2,
                sender=mentors[1],
                text='Me too! I prepared some examples for you.'
            )
            self.stdout.write('Created mock messages')
        
        self.stdout.write(self.style.SUCCESS('✓ Database seeded successfully!'))
        self.stdout.write('You can now login with:')
        self.stdout.write('  Admin: admin / admin123')
        self.stdout.write('  Learners: alice / password123, bob / password123')
        self.stdout.write('  Mentors: sarah_mentor / password123, mike_mentor / password123, etc.')
