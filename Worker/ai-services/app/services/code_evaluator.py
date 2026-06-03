"""
Comprehensive code quality evaluation system.
Evaluates correctness, efficiency, code quality, best practices, and innovation.
"""

import ast
import re
import subprocess
import tempfile
import os
import signal
import logging
import time
import resource
from typing import Dict, List, Optional, Tuple

try:
    import numpy as np
except ImportError:
    np = None

try:
    import radon.complexity as radon_cc
    from radon.metrics import mi_visit
except ImportError:
    radon_cc = None
    mi_visit = None

logger = logging.getLogger(__name__)


class CodeQualityEvaluator:
    """
    Comprehensive code quality evaluation system.

    Evaluates code submissions across multiple dimensions:
    - Correctness (test results): 40%
    - Efficiency (complexity analysis): 25%
    - Code Quality (readability, metrics): 20%
    - Best Practices (standards, security): 15%
    - Innovation (advanced techniques): Bonus up to 10%

    Example:
        evaluator = CodeQualityEvaluator()
        result = evaluator.evaluate_submission(
            code="def quicksort(arr):\n    ...",
            language="python",
            test_cases=[
                {"input": "[3,1,2]", "expected_output": "[1,2,3]"}
            ]
        )
    """

    def __init__(self):
        """Initialize code quality evaluator with language configurations."""
        self.language_configs = {
            "python": {
                "extension": ".py",
                "comment_symbols": ["#"],
                "max_line_length": 100,
            },
            "java": {
                "extension": ".java",
                "comment_symbols": ["//", "/*"],
                "max_line_length": 120,
            },
            "cpp": {
                "extension": ".cpp",
                "comment_symbols": ["//", "/*"],
                "max_line_length": 100,
            },
            "c": {
                "extension": ".c",
                "comment_symbols": ["//", "/*"],
                "max_line_length": 100,
            },
            "javascript": {
                "extension": ".js",
                "comment_symbols": ["//", "/*"],
                "max_line_length": 100,
            },
        }
        logger.info("CodeQualityEvaluator initialized")

    def evaluate_submission(
        self, code: str, language: str, test_cases: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Comprehensive code evaluation across multiple dimensions.

        Args:
            code: Source code to evaluate
            language: Programming language (python, java, cpp, javascript, c)
            test_cases: Optional list of test cases with expected outputs

        Returns:
            Dictionary with:
            - *_score: Individual scores (0-100)
            - final_score: Weighted final score (0-100)
            - test_results: Test execution results
            - feedback: List of feedback messages
            - execution_time: Average execution time (ms)
            - memory_used: Average memory usage (MB)
            - detailed_metrics: In-depth analysis by category
        """
        results = {
            "correctness_score": 0.0,
            "efficiency_score": 0.0,
            "code_quality_score": 0.0,
            "best_practices_score": 0.0,
            "innovation_score": 0.0,
            "final_score": 0.0,
            "test_results": [],
            "feedback": [],
            "execution_time": 0.0,
            "memory_used": 0.0,
            "detailed_metrics": {},
        }

        try:
            logger.info(f"Evaluating {language} code submission")

            # 1. Correctness Testing (40%)
            if test_cases:
                correctness_result = self.test_correctness(code, language, test_cases)
                results["correctness_score"] = correctness_result["score"]
                results["test_results"] = correctness_result["test_results"]
                results["execution_time"] = correctness_result.get(
                    "avg_execution_time", 0.0
                )
                results["memory_used"] = correctness_result.get("avg_memory_used", 0.0)
                logger.info(f"Correctness score: {results['correctness_score']:.1f}")
            else:
                results["correctness_score"] = 75.0
                logger.warning(
                    "No test cases provided, using default correctness score"
                )

            # 2. Efficiency Analysis (25%)
            efficiency_result = self.analyze_efficiency(code, language)
            results["efficiency_score"] = efficiency_result["score"]
            results["detailed_metrics"]["efficiency"] = efficiency_result
            logger.info(f"Efficiency score: {results['efficiency_score']:.1f}")

            # 3. Code Quality (20%)
            quality_result = self.assess_code_quality(code, language)
            results["code_quality_score"] = quality_result["score"]
            results["detailed_metrics"]["quality"] = quality_result
            logger.info(f"Quality score: {results['code_quality_score']:.1f}")

            # 4. Best Practices (15%)
            practices_result = self.check_best_practices(code, language)
            results["best_practices_score"] = practices_result["score"]
            results["detailed_metrics"]["practices"] = practices_result
            logger.info(f"Best practices score: {results['best_practices_score']:.1f}")

            # 5. Innovation (bonus up to 10%)
            innovation_result = self.assess_innovation(code, language)
            results["innovation_score"] = innovation_result["score"]
            results["detailed_metrics"]["innovation"] = innovation_result
            logger.info(f"Innovation score: {results['innovation_score']:.1f}")

            # Calculate weighted final score
            weights = {
                "correctness": 0.40,
                "efficiency": 0.25,
                "quality": 0.20,
                "practices": 0.15,
            }

            results["final_score"] = (
                results["correctness_score"] * weights["correctness"]
                + results["efficiency_score"] * weights["efficiency"]
                + results["code_quality_score"] * weights["quality"]
                + results["best_practices_score"] * weights["practices"]
            )

            # Add innovation bonus (max 10 points)
            innovation_bonus = (results["innovation_score"] / 100.0) * 10.0
            results["final_score"] = min(
                100.0, results["final_score"] + innovation_bonus
            )

            # Generate feedback
            results["feedback"] = self.generate_feedback(results)

            logger.info(f"Final score: {results['final_score']:.1f}")

        except Exception as e:
            logger.error(f"Evaluation error: {e}")
            results["error"] = str(e)
            results["feedback"].append(f"Error during evaluation: {str(e)}")

        return results

    def test_correctness(
        self, code: str, language: str, test_cases: List[Dict]
    ) -> Dict:
        """
        Run test cases and measure correctness.

        Args:
            code: Source code to test
            language: Programming language
            test_cases: List of test cases with expected outputs

        Returns:
            Correctness metrics including test results and score
        """
        results = {
            "score": 0.0,
            "test_results": [],
            "total_tests": len(test_cases),
            "passed_tests": 0,
            "avg_execution_time": 0.0,
            "avg_memory_used": 0.0,
        }

        logger.info(f"Running {len(test_cases)} test cases")

        total_points = sum(tc.get("points", 1) for tc in test_cases)
        earned_points = 0
        execution_times = []

        for idx, test_case in enumerate(test_cases):
            try:
                test_result = self._run_single_test(code, language, test_case)

                results["test_results"].append(
                    {
                        "test_number": idx + 1,
                        "passed": test_result["passed"],
                        "input": test_case.get("input", ""),
                        "expected": test_case.get("expected_output", ""),
                        "actual": test_result.get("output", ""),
                        "execution_time": test_result.get("execution_time", 0.0),
                        "error": test_result.get("error", ""),
                    }
                )

                if test_result["passed"]:
                    results["passed_tests"] += 1
                    earned_points += test_case.get("points", 1)

                if (
                    "execution_time" in test_result
                    and test_result["execution_time"] > 0
                ):
                    execution_times.append(test_result["execution_time"])

            except Exception as e:
                logger.warning(f"Error running test case {idx + 1}: {e}")
                results["test_results"].append(
                    {"test_number": idx + 1, "passed": False, "error": str(e)}
                )

        # Calculate score
        results["score"] = (
            (earned_points / total_points * 100.0) if total_points > 0 else 0.0
        )

        if execution_times and np:
            results["avg_execution_time"] = float(np.mean(execution_times))

        logger.info(f"Tests passed: {results['passed_tests']}/{len(test_cases)}")

        return results

    def _run_single_test(self, code: str, language: str, test_case: Dict) -> Dict:
        """
        Run a single test case.

        Args:
            code: Source code
            language: Programming language
            test_case: Test case with input and expected output

        Returns:
            Test result with pass/fail status
        """
        result = {"passed": False, "output": "", "execution_time": 0.0, "error": ""}

        try:
            if language == "python":
                result = self._run_python_test(code, test_case)
            else:
                result["error"] = (
                    f"Language '{language}' testing not fully supported in sandbox"
                )
                logger.warning(f"Language {language} testing not supported")

        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Test execution error: {e}")

        return result

    DANGEROUS_PATTERNS = [
        r"\bimport\s+os\b",
        r"\bimport\s+subprocess\b",
        r"\bimport\s+shutil\b",
        r"\bimport\s+sys\b",
        r"\bimport\s+ctypes\b",
        r"\bimport\s+socket\b",
        r"\b__import__\s*\(",
        r"\bexec\s*\(",
        r"\beval\s*\(",
        r"\bcompile\s*\(",
        r"\bopen\s*\(",
        r"__subclasses__\b",
        r"__globals__\b",
        r"__builtins__\b",
        r"\bos\.system\b",
        r"\bos\.popen\b",
        r"\bsubprocess\.",
        r"\bexecfile\b",
        r"\binput\s*\(",
    ]

    SANDBOX_ENV = {
        "PATH": "/usr/bin:/bin",
        "HOME": "/tmp",
        "SHELL": "/bin/sh",
        "LANG": "C.UTF-8",
        "LC_ALL": "C.UTF-8",
        "PYTHONPATH": "",
        "PYTHONHOME": "",
        "PYTHONSTARTUP": "",
        "PYTHONINSPECT": "",
        "PYTHONWARNINGS": "ignore",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONUNBUFFERED": "1",
    }

    MAX_OUTPUT_SIZE = 10 * 1024  # 10 KB

    def _is_sandbox_supported(self) -> bool:
        """Check if OS-level sandboxing is available."""
        return os.name == "posix" and hasattr(resource, "setrlimit")

    def _check_dangerous_code(self, code: str) -> Optional[str]:
        """Check code for dangerous patterns. Returns error message or None."""
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, code):
                return f"Code contains prohibited pattern: {pattern}"
        return None

    def _run_python_test(self, code: str, test_case: Dict) -> Dict:
        """
        Run a single test case against the submitted code.

        SECURITY: Code execution requires POSIX OS with resource limits.
        On unsupported platforms (Windows), execution is blocked to prevent
        unsandboxed code execution.
        """
        result = {
            "passed": False,
            "output": "",
            "error": None,
            "execution_time": 0.0,
        }

        if not self._is_sandbox_supported():
            result["error"] = (
                "Code execution requires a POSIX system with resource limit support. "
                "Windows is not supported for security reasons — deploy on Linux for sandboxed execution."
            )
            return result

        dangerous = self._check_dangerous_code(code)
        if dangerous:
            result["error"] = dangerous
            return result

        # Check for dangerous patterns
        danger = self._check_dangerous_code(code)
        if danger:
            result["error"] = danger
            return result

        temp_file = None
        start_time = time.time()
        timeout = max(1.0, test_case.get("time_limit", 5000) / 1000.0)

        try:
            # Create temporary file in a secure location
            temp_dir = tempfile.mkdtemp(prefix="sandbox_")
            temp_file = os.path.join(temp_dir, "script.py")

            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(code)

            start_time = time.time()

            def set_limits():
                """Set resource limits for the child process."""
                try:
                    resource.setrlimit(
                        resource.RLIMIT_CPU, (int(timeout) + 1, int(timeout) + 2)
                    )
                    resource.setrlimit(
                        resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024)
                    )
                    resource.setrlimit(
                        resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024)
                    )
                    resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
                    resource.setrlimit(resource.RLIMIT_NPROC, (32, 32))
                except (resource.error, ValueError):
                    pass

            process = subprocess.run(
                ["python3", "-I", "-c", f'exec(open("{temp_file}").read())'],
                input=test_case.get("input", ""),
                capture_output=True,
                text=True,
                timeout=timeout,
                env=self.SANDBOX_ENV,
                cwd="/tmp",
                preexec_fn=set_limits,
            )

            execution_time = (time.time() - start_time) * 1000.0
            result["execution_time"] = execution_time

            # Truncate output to prevent resource exhaustion
            stdout = process.stdout[: self.MAX_OUTPUT_SIZE] if process.stdout else ""
            stderr = process.stderr[: self.MAX_OUTPUT_SIZE] if process.stderr else ""

            result["output"] = stdout.strip()

            expected = str(test_case.get("expected_output", "")).strip()
            actual = result["output"]
            result["passed"] = actual == expected

            if stderr:
                result["error"] = stderr

        except subprocess.TimeoutExpired:
            result["error"] = f"Time Limit Exceeded (timeout: {timeout}s)"
        except subprocess.CalledProcessError as e:
            result["error"] = str(e.stderr)[:500] if e.stderr else str(e)[:200]
        except Exception as e:
            result["error"] = str(e)[:200]
        finally:
            try:
                if temp_file and os.path.exists(temp_file):
                    os.unlink(temp_file)
                if temp_dir and os.path.exists(temp_dir):
                    os.rmdir(temp_dir)
            except Exception:
                pass

        return result

    def analyze_efficiency(self, code: str, language: str) -> Dict:
        """
        Analyze code efficiency and time complexity.

        Args:
            code: Source code
            language: Programming language

        Returns:
            Efficiency metrics including complexity and score
        """
        result = {
            "score": 100.0,
            "cyclomatic_complexity": 0.0,
            "time_complexity_estimate": "O(?)",
            "issues": [],
        }

        if language == "python":
            try:
                if radon_cc:
                    # Calculate cyclomatic complexity
                    complexity_results = radon_cc.cc_visit(code)

                    if complexity_results and np:
                        complexities = [c.complexity for c in complexity_results]
                        result["cyclomatic_complexity"] = float(np.mean(complexities))

                        # Score based on complexity (ideal: 1-5)
                        if result["cyclomatic_complexity"] <= 5:
                            result["score"] = 100.0
                        elif result["cyclomatic_complexity"] <= 10:
                            result["score"] = 80.0
                        elif result["cyclomatic_complexity"] <= 15:
                            result["score"] = 60.0
                        else:
                            result["score"] = 40.0
                            result["issues"].append(
                                f"High cyclomatic complexity ({result['cyclomatic_complexity']:.1f})"
                            )

                # Detect inefficient patterns
                inefficiencies = self._detect_inefficiencies(code, language)
                if inefficiencies:
                    result["score"] -= len(inefficiencies) * 10.0
                    result["issues"].extend(inefficiencies[:3])  # Top 3 issues

                result["score"] = max(0.0, result["score"])

            except Exception as e:
                logger.warning(f"Complexity analysis error: {e}")
                result["error"] = str(e)

        return result

    def _detect_inefficiencies(self, code: str, language: str) -> List[str]:
        """
        Detect common inefficient patterns.

        Args:
            code: Source code
            language: Programming language

        Returns:
            List of detected inefficiencies
        """
        issues = []

        if language == "python":
            # Nested loops
            if re.search(r"for\s+\w+\s+in\s+.*:\s*\n\s+for\s+\w+\s+in", code):
                issues.append("Nested loops detected - may have O(n²) complexity")

            # String concatenation in loop
            if re.search(r'for\s+.*:\s*\n\s+\w+\s*\+=\s*["\']', code):
                issues.append("String concatenation in loop - use join() instead")

            # Inefficient list operations
            if ".append(" in code and "for" in code:
                if code.count(".append(") > 5:
                    issues.append(
                        "Multiple appends in loop - consider list comprehension"
                    )

        return issues

    def assess_code_quality(self, code: str, language: str) -> Dict:
        """
        Assess code quality metrics.

        Args:
            code: Source code
            language: Programming language

        Returns:
            Quality metrics and score
        """
        result = {"score": 100.0, "issues": [], "metrics": {}}

        try:
            # Comment ratio
            comment_ratio = self._calculate_comment_ratio(code, language)
            result["metrics"]["comment_ratio"] = comment_ratio

            if comment_ratio < 0.05:
                result["score"] -= 20.0
                result["issues"].append("Low code documentation")
            elif comment_ratio > 0.40:
                result["score"] -= 10.0
                result["issues"].append("Too many comments - unclear code")

            # Naming conventions
            naming_issues = self._check_naming_conventions(code, language)
            if naming_issues:
                result["score"] -= len(naming_issues) * 5.0
                result["issues"].extend(naming_issues)

            # Function length
            long_functions = self._check_function_length(code, language)
            if long_functions:
                result["score"] -= len(long_functions) * 5.0
                result["issues"].append(f"{len(long_functions)} overly long functions")

            # Code duplication
            duplication_score = self._detect_code_duplication(code)
            result["metrics"]["duplication_percentage"] = duplication_score

            if duplication_score > 20:
                result["score"] -= min(30.0, duplication_score / 2.0)
                result["issues"].append(f"{duplication_score:.1f}% code duplication")

            # Maintainability index (Python)
            if language == "python" and mi_visit:
                try:
                    mi_score = mi_visit(code, True)
                    result["metrics"]["maintainability_index"] = mi_score

                    if mi_score < 20:
                        result["score"] -= 15.0
                        result["issues"].append("Low maintainability index")
                except:
                    pass

            result["score"] = max(0.0, result["score"])

        except Exception as e:
            logger.warning(f"Quality assessment error: {e}")
            result["error"] = str(e)

        return result

    def _calculate_comment_ratio(self, code: str, language: str) -> float:
        """Calculate ratio of comment lines to total lines."""
        lines = code.split("\n")
        total_lines = len([l for l in lines if l.strip()])

        if total_lines == 0:
            return 0.0

        config = self.language_configs.get(language, {})
        comment_symbols = config.get("comment_symbols", ["#"])

        comment_lines = 0
        for line in lines:
            stripped = line.strip()
            if any(stripped.startswith(sym) for sym in comment_symbols):
                comment_lines += 1

        return float(comment_lines / total_lines) if total_lines > 0 else 0.0

    def _check_naming_conventions(self, code: str, language: str) -> List[str]:
        """Check naming convention compliance."""
        issues = []

        if language == "python":
            # Check for camelCase functions (should be snake_case)
            func_pattern = r"def\s+([A-Z][a-zA-Z0-9]*)\s*\("
            camel_funcs = re.findall(func_pattern, code)
            if camel_funcs:
                issues.append("Use snake_case for function names (PEP 8)")

        return issues

    def _check_function_length(self, code: str, language: str) -> List[str]:
        """Check for overly long functions."""
        long_functions = []

        if language == "python":
            try:
                tree = ast.parse(code)
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        if hasattr(node, "end_lineno"):
                            func_lines = node.end_lineno - node.lineno
                            if func_lines > 50:
                                long_functions.append(node.name)
            except:
                pass

        return long_functions

    def _detect_code_duplication(self, code: str) -> float:
        """Detect code duplication percentage."""
        lines = [
            l.strip()
            for l in code.split("\n")
            if l.strip() and not l.strip().startswith("#")
        ]

        if len(lines) < 5:
            return 0.0

        duplicates = 0
        checked = set()

        for i in range(len(lines) - 3):
            sequence = tuple(lines[i : i + 3])

            if sequence in checked:
                continue

            checked.add(sequence)

            count = sum(
                1 for j in range(len(lines) - 3) if tuple(lines[j : j + 3]) == sequence
            )

            if count > 1:
                duplicates += 3 * (count - 1)

        if np:
            duplication_percentage = (duplicates / len(lines)) * 100.0 if lines else 0.0
            return min(100.0, duplication_percentage)
        return 0.0

    def check_best_practices(self, code: str, language: str) -> Dict:
        """Check adherence to best practices."""
        result = {"score": 100.0, "issues": []}

        try:
            # Error handling
            if language == "python":
                if "try" not in code and "except" not in code:
                    if any(kw in code for kw in ["input(", "open(", "int(", "float("]):
                        result["score"] -= 15.0
                        result["issues"].append("Missing error handling")

            # Input validation
            if "input(" in code or "argv" in code:
                if not any(
                    kw in code for kw in ["if", "assert", "raise", "ValueError"]
                ):
                    result["score"] -= 10.0
                    result["issues"].append("Missing input validation")

            # Security checks
            security_issues = self._check_security(code, language)
            if security_issues:
                result["score"] -= len(security_issues) * 10.0
                result["issues"].extend(security_issues)

            result["score"] = max(0.0, result["score"])

        except Exception as e:
            logger.warning(f"Best practices check error: {e}")

        return result

    def _check_security(self, code: str, language: str) -> List[str]:
        """Check for security issues."""
        issues = []

        if language == "python":
            if "eval(" in code:
                issues.append("Security risk: avoid eval()")
            if "exec(" in code:
                issues.append("Security risk: avoid exec()")
            if "pickle.loads" in code:
                issues.append("Security risk: pickle can execute arbitrary code")

        return issues

    def assess_innovation(self, code: str, language: str) -> Dict:
        """Assess innovation and advanced techniques."""
        result = {
            "score": 50.0,  # Default medium score
            "features": [],
        }

        # Check for advanced techniques
        advanced_patterns = {
            "decorators": r"@\w+",
            "generators": r"yield\s+",
            "context_managers": r"with\s+\w+",
            "list_comprehensions": r"\[.+for\s+\w+\s+in\s+.+\]",
            "lambda_functions": r"lambda\s+\w+:",
            "type_hints": r":\s*\w+\s*=",
        }

        for feature, pattern in advanced_patterns.items():
            if re.search(pattern, code):
                result["score"] += 10.0
                result["features"].append(feature)

        result["score"] = min(100.0, result["score"])

        return result

    def generate_feedback(self, evaluation_results: Dict) -> List[str]:
        """Generate human-readable feedback based on evaluation."""
        feedback = []

        # Correctness
        correctness = evaluation_results.get("correctness_score", 0)
        if correctness == 100:
            feedback.append("✓ All test cases passed")
        elif correctness >= 70:
            feedback.append(f"Most test cases passed ({correctness:.0f}%)")
        else:
            feedback.append(
                f"Many test cases failed ({correctness:.0f}%) - review logic"
            )

        # Efficiency
        efficiency = evaluation_results.get("efficiency_score", 0)
        if efficiency >= 80:
            feedback.append("✓ Good code efficiency")
        else:
            feedback.append("Consider optimizing for better time/space complexity")

        # Quality
        quality = evaluation_results.get("code_quality_score", 0)
        if quality >= 80:
            feedback.append("✓ Excellent code quality")
        else:
            quality_issues = (
                evaluation_results.get("detailed_metrics", {})
                .get("quality", {})
                .get("issues", [])
            )
            if quality_issues:
                feedback.extend(quality_issues[:2])

        # Best Practices
        practices = evaluation_results.get("best_practices_score", 0)
        if practices >= 80:
            feedback.append("✓ Follows best practices")
        else:
            practice_issues = (
                evaluation_results.get("detailed_metrics", {})
                .get("practices", {})
                .get("issues", [])
            )
            if practice_issues:
                feedback.extend(practice_issues[:2])

        # Innovation
        innovation = evaluation_results.get("innovation_score", 0)
        if innovation > 70:
            features = (
                evaluation_results.get("detailed_metrics", {})
                .get("innovation", {})
                .get("features", [])
            )
            if features:
                feedback.append(
                    f"Great use of advanced techniques: {', '.join(features)}"
                )

        return feedback


__all__ = ["CodeQualityEvaluator"]
