"""
AI-powered resume screening and candidate matching system.
Extracts skills, experience, education, and calculates job fit scores.
"""

import re
import logging
from typing import Dict, List, Optional, Set, Tuple
from collections import Counter

try:
    import spacy
except ImportError:
    spacy = None

logger = logging.getLogger(__name__)


class ResumeScreener:
    """
    AI-powered resume screening and candidate matching.
    
    Analyzes resumes to extract:
    - Technical and soft skills
    - Years of experience
    - Education level
    - Experience in specific domains
    
    Calculates match score against job requirements using weighted scoring.
    
    Example:
        screener = ResumeScreener()
        result = screener.screen_resume(
            resume_text="Python developer with 5 years experience...",
            job_description="Senior Python developer needed",
            required_skills=["Python", "AWS", "Docker"]
        )
    """
    
    def __init__(self, use_nlp: bool = True):
        """
        Initialize resume screener.
        
        Args:
            use_nlp: Whether to use spaCy NLP for advanced extraction
        """
        self.nlp = None
        self.use_nlp = use_nlp
        
        if use_nlp:
            try:
                self.nlp = spacy.load("en_core_web_sm")
                logger.info("spaCy model loaded successfully")
            except OSError:
                logger.warning(
                    "spaCy model not found. Install with: python -m spacy download en_core_web_sm"
                )
                self.use_nlp = False
            except Exception as e:
                logger.warning(f"Failed to load spaCy model: {e}")
                self.use_nlp = False
        
        # Skill databases
        self.technical_skills = self._load_technical_skills()
        self.soft_skills = self._load_soft_skills()
        self.all_skills = self.technical_skills | self.soft_skills
        
        logger.info(f"ResumeScreener initialized with {len(self.all_skills)} skills in database")
    
    def _load_technical_skills(self) -> Set[str]:
        """
        Load technical skills database.
        
        Returns:
            Set of technical skill keywords
        """
        return {
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go',
            'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
            'perl', 'groovy', 'clojure', 'elixir', 'erlang',
            
            # Web Technologies
            'react', 'angular', 'vue', 'svelte', 'ember', 'next.js', 'nuxt',
            'nodejs', 'node.js', 'express', 'django', 'flask', 'fastapi',
            'spring', 'spring boot', 'asp.net', 'laravel', 'rails',
            
            # Databases
            'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis',
            'elasticsearch', 'oracle', 'cassandra', 'dynamodb', 'firestore',
            'neo4j', 'couchdb', 'mariadb', 'sqlite', 'hbase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel',
            'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions',
            'terraform', 'ansible', 'ci/cd', 'helm', 'prometheus', 'grafana',
            
            # Data & ML
            'machine learning', 'deep learning', 'tensorflow', 'pytorch',
            'scikit-learn', 'sklearn', 'pandas', 'numpy', 'data analysis',
            'nlp', 'computer vision', 'hadoop', 'spark', 'kafka',
            'airflow', 'bigquery', 'redshift',
            
            # Tools
            'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
            'postman', 'swagger', 'openapi', 'linux', 'unix', 'bash', 'shell',
            'rest', 'graphql', 'grpc', 'soap', 'xml', 'json',
            
            # Mobile
            'android', 'ios', 'react native', 'flutter', 'kotlin', 'swift',
            
            # Other
            'microservices', 'serverless', 'api', 'cdn', 'nginx', 'apache',
            'ssl', 'tls', 'security', 'encryption'
        }
    
    def _load_soft_skills(self) -> Set[str]:
        """
        Load soft skills database.
        
        Returns:
            Set of soft skill keywords
        """
        return {
            'leadership', 'communication', 'teamwork', 'problem solving',
            'problem-solving', 'analytical', 'analytical thinking', 'creative',
            'creativity', 'adaptable', 'adaptability', 'organized', 'organization',
            'time management', 'project management', 'agile', 'scrum',
            'mentoring', 'mentorship', 'coaching', 'negotiation',
            'critical thinking', 'decision making', 'strategic thinking',
            'collaboration', 'conflict resolution', 'public speaking',
            'presentation', 'listening', 'emotional intelligence'
        }
    
    def screen_resume(
        self,
        resume_text: str,
        job_description: str,
        required_skills: List[str],
        nice_to_have_skills: Optional[List[str]] = None,
        min_experience_years: Optional[int] = None
    ) -> Dict:
        """
        Comprehensive resume screening against job requirements.
        
        Args:
            resume_text: Full resume text
            job_description: Job description/requirements
            required_skills: List of required skills
            nice_to_have_skills: Optional list of bonus skills
            min_experience_years: Minimum required experience
        
        Returns:
            Dictionary with:
            - match_score: Overall match (0-100)
            - skill_match_percentage: Required skills matched (0-100)
            - extracted_skills: Skills found in resume
            - experience_years: Detected years of experience
            - education_level: Highest education detected
            - strengths: Skills matched
            - gaps: Missing required skills
            - recommendation: Hiring recommendation
        """
        try:
            logger.info("Starting resume screening analysis")
            
            result = {
                'match_score': 0.0,
                'skill_match_percentage': 0.0,
                'extracted_skills': [],
                'experience_years': 0,
                'education_level': None,
                'certifications': [],
                'strengths': [],
                'gaps': [],
                'red_flags': [],
                'recommendation': '',
                'detailed_analysis': {}
            }
            
            # Extract information from resume
            result['extracted_skills'] = self.extract_skills(resume_text)
            result['experience_years'] = self.extract_experience(resume_text)
            result['education_level'] = self.extract_education(resume_text)
            result['certifications'] = self.extract_certifications(resume_text)
            
            logger.debug(f"Extracted {len(result['extracted_skills'])} skills")
            logger.debug(f"Detected {result['experience_years']} years of experience")
            
            # Calculate skill match
            required_set = set(skill.lower() for skill in required_skills)
            candidate_skills = set(skill.lower() for skill in result['extracted_skills'])
            
            matched_required = required_set & candidate_skills
            
            if required_set:
                result['skill_match_percentage'] = (len(matched_required) / len(required_set)) * 100.0
            
            # Check nice-to-have skills
            nice_to_have_set = set(skill.lower() for skill in (nice_to_have_skills or []))
            matched_nice_to_have = nice_to_have_set & candidate_skills
            
            # Calculate overall match score
            result['match_score'] = self._calculate_match_score(
                resume_text=resume_text,
                job_description=job_description,
                extracted_info=result,
                required_skills=required_set,
                matched_required=matched_required,
                min_experience_years=min_experience_years
            )
            
            # Identify strengths and gaps
            result['strengths'] = sorted(list(matched_required))
            result['gaps'] = sorted(list(required_set - candidate_skills))
            
            # Detect red flags
            result['red_flags'] = self._detect_red_flags(resume_text, result)
            
            # Generate recommendation
            result['recommendation'] = self._generate_recommendation(result)
            
            logger.info(
                f"Resume screening complete: {result['match_score']:.1f}% match "
                f"({len(matched_required)}/{len(required_set)} skills)"
            )
            
            return result
        
        except Exception as e:
            logger.error(f"Resume screening error: {e}")
            return {
                'error': str(e),
                'match_score': 0.0,
                'skill_match_percentage': 0.0,
                'recommendation': 'Unable to process resume'
            }
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from resume text.
        
        Uses keyword matching and optional NLP for additional extraction.
        
        Args:
            text: Resume text
        
        Returns:
            List of extracted skills
        """
        text_lower = text.lower()
        found_skills = set()
        
        # Keyword-based extraction
        for skill in self.all_skills:
            # Use word boundary matching for better accuracy
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower, re.IGNORECASE):
                found_skills.add(skill.title())
        
        # NLP-based extraction (if available)
        if self.use_nlp and self.nlp:
            try:
                doc = self.nlp(text)
                for ent in doc.ents:
                    if ent.label_ == 'PRODUCT':  # Often catches tech products
                        skill = ent.text.strip()
                        if skill and len(skill) > 2:
                            found_skills.add(skill)
            except Exception as e:
                logger.debug(f"NLP extraction error: {e}")
        
        return sorted(list(found_skills))
    
    def extract_experience(self, text: str) -> int:
        """
        Extract years of experience from resume text.
        
        Uses regex patterns to find experience mentions.
        
        Args:
            text: Resume text
        
        Returns:
            Maximum years of experience found
        """
        # Patterns for experience extraction
        patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience',
            r'(?:professional\s+)?experience\s*:?\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*(?:year|yr|yrs?)\s+(?:exp|experience)',
            r'(?:current|currently)\s+(?:working|employed)\s+for\s+(\d+)\+?\s*years?',
        ]
        
        years_found = []
        
        for pattern in patterns:
            matches = re.findall(pattern, text.lower(), re.IGNORECASE)
            if matches:
                try:
                    years_found.extend([int(m) for m in matches])
                except ValueError:
                    pass
        
        return max(years_found) if years_found else 0
    
    def extract_education(self, text: str) -> Optional[str]:
        """
        Extract highest education level from resume.
        
        Args:
            text: Resume text
        
        Returns:
            Education level (phd, masters, bachelors, high_school) or None
        """
        text_lower = text.lower()
        
        # Check for PhD
        if any(deg in text_lower for deg in ['phd', 'ph.d', 'doctorate', 'd.sc', 'dsc']):
            return 'phd'
        
        # Check for Masters
        if any(deg in text_lower for deg in ['master', "master's", 'msc', 'm.sc', 'mba', 'm.b.a', 'ma', 'm.a']):
            return 'masters'
        
        # Check for Bachelors
        if any(deg in text_lower for deg in ['bachelor', "bachelor's", 'bsc', 'b.sc', 'b.tech', 'b.e', 'ba', 'b.a', 'bs', 'b.s']):
            return 'bachelors'
        
        # Check for High School
        if any(term in text_lower for term in ['high school', 'secondary', 'a level', 'a-level']):
            return 'high_school'
        
        return None
    
    def extract_certifications(self, text: str) -> List[str]:
        """
        Extract certifications from resume.
        
        Args:
            text: Resume text
        
        Returns:
            List of detected certifications
        """
        certifications = set()
        
        cert_patterns = [
            r'(?:certified|certification|cert)\s+(?:in\s+)?([a-zA-Z0-9\s\-\.]+?)(?:\n|,|;)',
            r'(aws.*?certified|gcp.*?certified|azure.*?certified)',
            r'(cissp|cism|cisa|comptia|ccna|ccnp)',
            r'(agile|scrum master|pmp)',
            r'(certified.*?instructor|cti)',
        ]
        
        for pattern in cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            certifications.update([m.strip() for m in matches if m])
        
        return sorted(list(certifications))[:10]  # Top 10
    
    def _calculate_match_score(
        self,
        resume_text: str,
        job_description: str,
        extracted_info: Dict,
        required_skills: Set[str],
        matched_required: Set[str],
        min_experience_years: Optional[int] = None
    ) -> float:
        """
        Calculate overall candidate-job match score.
        
        Weighted calculation:
        - Required skills match: 50%
        - Experience level: 30%
        - Education: 20%
        
        Args:
            resume_text: Resume text
            job_description: Job description
            extracted_info: Extracted resume information
            required_skills: Set of required skills
            matched_required: Set of matched skills
            min_experience_years: Minimum required experience
        
        Returns:
            Match score (0-100)
        """
        # Component 1: Skill Match (50%)
        if required_skills:
            skill_score = (len(matched_required) / len(required_skills)) * 100.0
        else:
            skill_score = 50.0
        
        # Component 2: Experience Score (30%)
        exp_years = extracted_info['experience_years']
        min_exp = min_experience_years or 0
        
        if exp_years >= min_exp + 5:
            exp_score = 100.0
        elif exp_years >= min_exp + 3:
            exp_score = 85.0
        elif exp_years >= min_exp:
            exp_score = 70.0
        elif exp_years >= max(0, min_exp - 2):
            exp_score = 50.0
        else:
            exp_score = 20.0
        
        # Component 3: Education Score (20%)
        education_map = {
            'phd': 100.0,
            'masters': 90.0,
            'bachelors': 80.0,
            'high_school': 60.0
        }
        edu_score = education_map.get(extracted_info['education_level'], 50.0)
        
        # Weighted average
        final_score = (
            skill_score * 0.50 +
            exp_score * 0.30 +
            edu_score * 0.20
        )
        
        logger.debug(
            f"Score components - Skills: {skill_score:.1f}, "
            f"Experience: {exp_score:.1f}, Education: {edu_score:.1f}, "
            f"Final: {final_score:.1f}"
        )
        
        return round(final_score, 1)
    
    def _detect_red_flags(self, resume_text: str, extracted_info: Dict) -> List[str]:
        """
        Detect potential red flags in resume.
        
        Args:
            resume_text: Resume text
            extracted_info: Extracted information
        
        Returns:
            List of detected red flags
        """
        red_flags = []
        text_lower = resume_text.lower()
        
        # Check for gaps in employment (look for suspicious date patterns)
        # This is a simplified check - production would use date parsing
        
        # Check for frequent job changes
        job_change_indicators = text_lower.count('12 months') + text_lower.count('6 months')
        if job_change_indicators >= 3:
            red_flags.append("Frequent job changes detected")
        
        # Check for spelling/grammar issues (count special patterns)
        if text_lower.count('  ') > 10:  # Multiple double spaces
            red_flags.append("Resume formatting issues")
        
        # Check for vague experience claims
        vague_terms = ['involved', 'helped', 'assisted']
        vague_count = sum(text_lower.count(term) for term in vague_terms)
        if vague_count > 5:
            red_flags.append("Vague responsibility descriptions")
        
        return red_flags
    
    def _generate_recommendation(self, result: Dict) -> str:
        """
        Generate hiring recommendation.
        
        Args:
            result: Screening result dictionary
        
        Returns:
            Recommendation text
        """
        score = result['match_score']
        red_flag_count = len(result.get('red_flags', []))
        
        if red_flag_count > 2:
            return "Review required - Multiple concerns detected"
        
        if score >= 85:
            return "Strong candidate - Highly recommended for interview"
        elif score >= 70:
            return "Good candidate - Recommend for technical interview"
        elif score >= 55:
            return "Potential candidate - Review carefully"
        elif score >= 40:
            return "Below expectations - Consider only if other candidates lacking"
        else:
            return "Not recommended - Does not meet core requirements"
    
    def compare_candidates(self, candidates: List[Dict]) -> List[Dict]:
        """
        Compare and rank multiple candidates.
        
        Args:
            candidates: List of candidate dictionaries with resume_text and job_description
        
        Returns:
            Sorted list of candidates by match score
        """
        results = []
        
        for candidate in candidates:
            result = self.screen_resume(
                resume_text=candidate.get('resume_text', ''),
                job_description=candidate.get('job_description', ''),
                required_skills=candidate.get('required_skills', [])
            )
            result['candidate_id'] = candidate.get('candidate_id')
            results.append(result)
        
        # Sort by match score
        return sorted(results, key=lambda x: x.get('match_score', 0), reverse=True)


__all__ = ["ResumeScreener"]
