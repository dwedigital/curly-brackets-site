---
title: "What is Temperature in LLMs? A Deep Dive for Developers"
date: "2025-12-18"
tags: ['Machine Learning','LLM']

---
If you have ever tweaked settings in the OpenAI playground or adjusted parameters for an API call to Llama 2 or GPT-4, you have likely encountered the **Temperature** setting. While it is often explained simply as a "creativity slider," the underlying mechanics are rooted in probability theory and linear algebra.

For software engineers building on top of Large Language Models (LLMs), understanding how temperature manipulates statistical probability is crucial for controlling model behavior. Let's dive into the math, the code, and the practical application of this hyperparameter.

## The Math: Logits and Softmax

To understand temperature, we first need to look at the final layer of a transformer model. When an LLM predicts the next token, it doesn't immediately output a word. Instead, it produces a vector of raw numbers called **logits**. Each entry in this vector corresponds to a token in the model's vocabulary.

Under normal circumstances, we pass these logits through a **Softmax** function to convert them into probabilities that sum to 1.0.

Standard Softmax formula for the $i$-th token:

$$
P_i = \frac{e^{z_i}}{\sum_{j} e^{z_j}}
$$

Where $z$ is the input logit.

## Injecting Temperature

Temperature ($T$) acts as a scaling factor applied to the logits **before** they are passed to the Softmax function.

Modified formula with Temperature:

$$
P_i = \frac{e^{z_i / T}}{\sum_{j} e^{z_j / T}}
$$

Here is how this scaling affects the distribution statistically:

1.  **Low Temperature ($T < 1.0$)**: Dividing by a small number makes the logits larger (magnifies differences). This pushes probabilities of likely tokens closer to 1.0 and unlikely tokens closer to 0.0. The distribution becomes **sharper** (lower entropy).
2.  **High Temperature ($T > 1.0$)**: Dividing by a large number shrinks the logits toward zero. Since $e^0 = 1$, the exponentials of all tokens become closer in value. The distribution becomes **flatter** (higher entropy).

## Python Implementation

Let's visualize this with a simple Python script using NumPy. We will take a hypothetical set of logits for the next word in the sentence "The sky is ____".

```python
import numpy as np
import matplotlib.pyplot as plt

def softmax(logits, temperature=1.0):
    # Avoid division by zero
    temperature = max(temperature, 1e-7)
    
    # Scale logits by temperature
    scaled_logits = logits / temperature
    
    # Compute softmax
    # (subtract max for numerical stability)
    exp_values = np.exp(scaled_logits - np.max(scaled_logits))
    probabilities = exp_values / np.sum(exp_values)
    
    return probabilities

# Hypothetical logits for ["blue", "cloudy", "green", "pizza"]
logits = np.array([10.0, 8.0, -5.0, -10.0])

print(f"Temp 0.1: {softmax(logits, temperature=0.1)}")
print(f"Temp 1.0: {softmax(logits, temperature=1.0)}")
print(f"Temp 5.0: {softmax(logits, temperature=5.0)}")
```

**Output Analysis:**
*   **At T=0.1**: The probability of "blue" might be 0.999, effectively forcing the model to choose the most likely token (Determinism).
*   **At T=1.0**: "blue" might be 0.88 and "cloudy" 0.12. The model usually picks "blue", but occasionally "cloudy".
*   **At T=5.0**: The probabilities flatten out. "Pizza" (a statistically unlikely completion) gains a significant probability mass, leading to potential hallucinations or "creative" nonsense.

## When to Change the Value

Understanding the statistical impact allows us to map temperature settings to specific engineering tasks.

### Low Temperature (0.0 - 0.3)
**Goal:** Precision, Determinism, Factual Accuracy.

Use this range when there is effectively only "one right answer."

*   **Code Generation:** You want syntax-correct, standard code, not experimental libraries that don't exist.
*   **Data Extraction:** Pulling names or dates from text.
*   **Math/Logic:** solving arithmetic or logical reasoning.

### Medium Temperature (0.4 - 0.7)
**Goal:** Naturalness, conversational flow.

This is often the default for chatbots. It allows for variety in sentence structure without straying too far from the topic.

*   **Summarization:** You want the core facts but phrased naturally.
*   **General Chat:** Prevents robotic, repetitive responses.

### High Temperature (0.8 - 1.5+)
**Goal:** Ideation, Creativity, Diversity.

Use this when you want the model to surprise you or when there are many valid answers.

*   **Brainstorming:** Generating marketing slogans or plot points.
*   **Poetry/Fiction:** Metaphors and interesting adjectives often live in the lower-probability tails of the distribution.

## Conclusion

Temperature is not magic; it is a scalar value that adjusts the entropy of the next-token probability distribution. By mastering this parameter, you move from simply prompting LLMs to engineering their probabilistic behavior to suit your specific application needs.
