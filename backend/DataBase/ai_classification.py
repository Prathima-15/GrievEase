"""
AI Classification Service for GrievEase Petitions
This is a dummy implementation that will be replaced with actual AI model integration
"""

import re
import random
from typing import Dict, Tuple, Optional
from sqlalchemy.orm import Session
from enhanced_models import Department, Category

class AIClassificationService:
    """
    Dummy AI Classification Service for petition department and category prediction
    This simulates an AI model that analyzes petition content and predicts appropriate classification
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.departments = {}
        self.categories = {}
        self._load_classification_data()
    
    def _load_classification_data(self):
        """Load departments and categories for classification"""
        try:
            # Load departments
            departments = self.db.query(Department).all()
            for dept in departments:
                self.departments[dept.department_id] = {
                    'name': dept.department_name,
                    'description': dept.description
                }
            
            # Load categories with keywords
            categories = self.db.query(Category).all()
            for cat in categories:
                self.categories[cat.category_id] = {
                    'name': cat.category_name,
                    'code': cat.category_code,
                    'department_id': cat.department_id,
                    'keywords': cat.keywords or [],
                    'description': cat.description
                }
            
            # Ensure we have fallback data if database is empty
            if not self.departments:
                self.departments = {
                    1: {'name': 'Public Works', 'description': 'General public works and infrastructure'},
                    2: {'name': 'Municipal Corporation', 'description': 'Municipal services and administration'}
                }
            
            if not self.categories:
                self.categories = {
                    1: {'name': 'General Inquiry', 'code': 'GENERAL', 'description': 'General complaints and inquiries', 'department_id': 1, 'keywords': []},
                    2: {'name': 'Infrastructure', 'code': 'INFRA', 'description': 'Infrastructure related issues', 'department_id': 1, 'keywords': ['road', 'water', 'electricity']}
                }
                
        except Exception as e:
            print(f"Warning: Could not load classification data from database: {e}")
            # Use fallback data
            self.departments = {
                1: {'name': 'Public Works', 'description': 'General public works and infrastructure'},
                2: {'name': 'Municipal Corporation', 'description': 'Municipal services and administration'}
            }
            self.categories = {
                1: {'name': 'General Inquiry', 'code': 'GENERAL', 'description': 'General complaints and inquiries', 'department_id': 1, 'keywords': []},
                2: {'name': 'Infrastructure', 'code': 'INFRA', 'description': 'Infrastructure related issues', 'department_id': 1, 'keywords': ['road', 'water', 'electricity']}
            }
    
    def classify_petition(self, title: str, description: str, location: str = None) -> Dict:
        """
        Classify a petition into department, category, and urgency level
        
        Args:
            title: Petition title
            description: Petition description
            location: Optional location information
            
        Returns:
            Dict containing classification results with confidence scores
        """
        
        # Combine text for analysis
        full_text = f"{title} {description} {location or ''}".lower()
        
        # Dummy AI classification logic (keyword matching)
        department_scores = self._calculate_department_scores(full_text)
        best_department_id, dept_confidence = max(department_scores.items(), key=lambda x: x[1])
        
        # Find best category within the department
        category_scores = self._calculate_category_scores(full_text, best_department_id)
        
        if category_scores:
            best_category_id, cat_confidence = max(category_scores.items(), key=lambda x: x[1])
        else:
            best_category_id, cat_confidence = None, 0
        
        # AI-determined urgency level
        urgency_level = self._determine_urgency_level(full_text)
        
        # Calculate overall confidence (average of department and category confidence)
        overall_confidence = int((dept_confidence + cat_confidence) / 2) if cat_confidence > 0 else dept_confidence
        
        # Add some randomness to simulate AI model uncertainty
        confidence_variation = random.randint(-10, 10)
        overall_confidence = max(0, min(100, overall_confidence + confidence_variation))
        
        return {
            'department_id': best_department_id,
            'department_name': self.departments[best_department_id]['name'],
            'category_id': best_category_id,
            'category_name': self.categories[best_category_id]['name'] if best_category_id else None,
            'urgency_level': urgency_level,
            'confidence': overall_confidence,
            'department_confidence': dept_confidence,
            'category_confidence': cat_confidence,
            'ai_reasoning': self._generate_reasoning(full_text, best_department_id, best_category_id, urgency_level)
        }
    
    def _calculate_department_scores(self, text: str) -> Dict[int, int]:
        """Calculate department scores based on keyword matching"""
        dept_keywords = {
            1: ['road', 'water', 'pipe', 'street', 'light', 'building', 'infrastructure', 'maintenance', 'repair'],  # Public Works
            2: ['health', 'hospital', 'doctor', 'medicine', 'treatment', 'ambulance', 'medical', 'pregnant'],  # Health
            3: ['school', 'education', 'teacher', 'student', 'book', 'uniform', 'scholarship', 'classroom'],  # Education
            4: ['transport', 'bus', 'traffic', 'vehicle', 'registration', 'license', 'auto', 'rickshaw'],  # Transportation
            5: ['land', 'property', 'tax', 'revenue', 'registration', 'survey', 'record', 'title'],  # Revenue
            6: ['police', 'crime', 'theft', 'safety', 'security', 'complaint', 'fir', 'violence'],  # Police
            7: ['municipal', 'urban', 'building', 'permit', 'waste', 'garbage', 'park', 'planning'],  # Municipal
            8: ['agriculture', 'crop', 'farmer', 'fertilizer', 'irrigation', 'insurance', 'pest', 'farm'],  # Agriculture
            9: ['forest', 'tree', 'wildlife', 'environment', 'conservation', 'pollution', 'animal'],  # Forest
            10: ['welfare', 'pension', 'scheme', 'women', 'child', 'disability', 'assistance', 'elderly']  # Social Welfare
        }
        
        scores = {}
        for dept_id, keywords in dept_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text:
                    score += 10  # Each keyword match gives 10 points
            
            # Bonus for multiple keyword matches
            matches = sum(1 for keyword in keywords if keyword in text)
            if matches > 1:
                score += matches * 5  # Bonus for multiple matches
            
            scores[dept_id] = min(score, 100)  # Cap at 100
        
        # Ensure we always have a classification (default to Public Works if no matches)
        if all(score == 0 for score in scores.values()):
            scores[1] = 30  # Default confidence for Public Works
        
        return scores
    
    def _determine_urgency_level(self, text: str) -> str:
        """
        Determine urgency level based on text analysis
        
        Args:
            text: The petition text to analyze
            
        Returns:
            str: Urgency level ('low', 'medium', 'high', 'critical')
        """
        
        # Critical urgency keywords
        critical_keywords = [
            'emergency', 'urgent', 'immediate', 'life threatening', 'danger', 'critical',
            'accident', 'fire', 'flood', 'collapse', 'death', 'dying', 'bleeding',
            'poison', 'explosion', 'gas leak', 'electrical hazard', 'violence',
            'assault', 'robbery', 'kidnap', 'child abuse', 'domestic violence'
        ]
        
        # High urgency keywords
        high_keywords = [
            'broken', 'not working', 'damaged', 'leak', 'overflow', 'blocked',
            'severe', 'serious', 'major', 'widespread', 'affecting many',
            'health risk', 'safety concern', 'public safety', 'contaminated',
            'infectious', 'disease outbreak', 'pain', 'sick', 'injury', 'hurt'
        ]
        
        # Medium urgency keywords
        medium_keywords = [
            'repair', 'fix', 'maintenance', 'replace', 'improve', 'upgrade',
            'complaint', 'issue', 'problem', 'concern', 'request', 'need',
            'poor condition', 'old', 'worn out', 'inefficient', 'slow'
        ]
        
        # Low urgency keywords
        low_keywords = [
            'suggestion', 'recommend', 'enhance', 'beautify', 'convenience',
            'future', 'plan', 'consider', 'proposal', 'idea', 'optional',
            'when possible', 'at your convenience', 'non-urgent', 'minor'
        ]
        
        # Calculate urgency scores
        critical_score = sum(2 for keyword in critical_keywords if keyword in text)
        high_score = sum(1.5 for keyword in high_keywords if keyword in text)
        medium_score = sum(1 for keyword in medium_keywords if keyword in text)
        low_score = sum(0.5 for keyword in low_keywords if keyword in text)
        
        # Time-related urgency indicators
        time_urgent = any(phrase in text for phrase in [
            'as soon as possible', 'asap', 'immediately', 'right now', 'today',
            'this week', 'urgent', 'emergency', 'can\'t wait'
        ])
        
        # Determine urgency level based on scores and indicators
        if critical_score > 0 or time_urgent:
            return 'critical'
        elif high_score >= 2:
            return 'high'
        elif high_score >= 1 or medium_score >= 3:
            return 'high'
        elif medium_score >= 1 or low_score >= 2:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_category_scores(self, text: str, department_id: int) -> Dict[int, int]:
        """Calculate category scores within a department"""
        scores = {}
        
        # Get categories for this department
        dept_categories = [cat_id for cat_id, cat_data in self.categories.items() 
                          if cat_data['department_id'] == department_id]
        
        for cat_id in dept_categories:
            cat_data = self.categories[cat_id]
            score = 0
            
            # Check keyword matches
            for keyword in cat_data['keywords']:
                if keyword in text:
                    score += 15  # Each keyword match gives 15 points
            
            # Bonus for category name in text
            if cat_data['name'].lower() in text:
                score += 20
            
            scores[cat_id] = min(score, 100)  # Cap at 100
        
        return scores
    
    def _generate_reasoning(self, text: str, dept_id: int, cat_id: int, urgency_level: str) -> str:
        """Generate AI reasoning explanation"""
        dept_name = self.departments[dept_id]['name']
        cat_name = self.categories[cat_id]['name'] if cat_id else "General"
        
        # Find matched keywords
        all_keywords = []
        if cat_id:
            all_keywords = self.categories[cat_id]['keywords']
        
        matched_keywords = [kw for kw in all_keywords if kw in text]
        
        reasoning = f"Classified as {dept_name} - {cat_name} with {urgency_level} priority based on "
        
        if matched_keywords:
            reasoning += f"keywords: {', '.join(matched_keywords[:3])}"
        else:
            reasoning += "content analysis and context"
        
        # Add urgency reasoning
        urgency_reasons = {
            'critical': 'emergency indicators and immediate action keywords',
            'high': 'safety concerns and urgent repair needs',
            'medium': 'standard issue requiring timely attention',
            'low': 'non-urgent improvement or suggestion'
        }
        
        reasoning += f". Priority determined by {urgency_reasons.get(urgency_level, 'content analysis')}."
        
        return reasoning
    
    def suggest_reclassification(self, petition_id: int, new_dept_id: int = None, new_cat_id: int = None) -> Dict:
        """
        Handle manual reclassification by officers
        
        Args:
            petition_id: ID of the petition to reclassify
            new_dept_id: New department ID (optional)
            new_cat_id: New category ID (optional)
            
        Returns:
            Dict with reclassification results
        """
        
        # This would update the petition in the database
        # For now, just return the new classification
        
        result = {
            'success': True,
            'message': 'Petition reclassified successfully',
            'manually_classified': True,
            'confidence': 100  # Manual classification has 100% confidence
        }
        
        if new_dept_id:
            result['new_department'] = self.departments[new_dept_id]['name']
        
        if new_cat_id:
            result['new_category'] = self.categories[new_cat_id]['name']
        
        return result
    
    def get_classification_suggestions(self, text: str, top_n: int = 3) -> Dict:
        """
        Get top N classification suggestions for manual review
        
        Args:
            text: Text to classify
            top_n: Number of top suggestions to return
            
        Returns:
            Dict with top suggestions
        """
        
        # Get all department scores
        dept_scores = self._calculate_department_scores(text.lower())
        top_departments = sorted(dept_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
        
        suggestions = []
        for dept_id, score in top_departments:
            # Get top categories for this department
            cat_scores = self._calculate_category_scores(text.lower(), dept_id)
            
            if cat_scores:
                top_cat_id, cat_score = max(cat_scores.items(), key=lambda x: x[1])
                category_name = self.categories[top_cat_id]['name']
            else:
                category_name = "General"
                cat_score = 0
            
            suggestions.append({
                'department_id': dept_id,
                'department_name': self.departments[dept_id]['name'],
                'category_name': category_name,
                'confidence': score,
                'reasoning': f"Matched keywords and content analysis (confidence: {score}%)"
            })
        
        return {
            'suggestions': suggestions,
            'text_analyzed': len(text.split()),
            'classification_method': 'keyword_matching_ai_simulation'
        }

def get_ai_classifier(db_session: Session) -> AIClassificationService:
    """Factory function to get AI classifier instance"""
    return AIClassificationService(db_session)