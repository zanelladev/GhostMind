// Gaussian Naive Bayes in pure TypeScript. Each feature is modelled as a
// per-class Gaussian; class scores combine the log-prior with the sum of
// per-feature log-likelihoods (the naive conditional-independence assumption).

const MIN_VAR = 1e-6; // variance floor: avoids division by zero / overconfidence

interface ClassStats {
  label: string;
  prior: number;
  means: number[];
  variances: number[];
}

export class GaussianNB {
  private classes: ClassStats[] = [];

  fit(X: number[][], y: string[]): this {
    if (X.length === 0 || X.length !== y.length) {
      throw new Error("GaussianNB.fit: X and y must be non-empty and aligned");
    }
    const dims = X[0].length;
    const byClass = new Map<string, number[][]>();
    for (let i = 0; i < X.length; i++) {
      const bucket = byClass.get(y[i]) ?? [];
      bucket.push(X[i]);
      byClass.set(y[i], bucket);
    }

    this.classes = [];
    for (const [label, rows] of byClass) {
      const means = new Array(dims).fill(0);
      const variances = new Array(dims).fill(0);
      for (const row of rows) {
        for (let d = 0; d < dims; d++) means[d] += row[d];
      }
      for (let d = 0; d < dims; d++) means[d] /= rows.length;
      for (const row of rows) {
        for (let d = 0; d < dims; d++) {
          const diff = row[d] - means[d];
          variances[d] += diff * diff;
        }
      }
      for (let d = 0; d < dims; d++) {
        variances[d] = Math.max(variances[d] / rows.length, MIN_VAR);
      }
      this.classes.push({
        label,
        prior: rows.length / X.length,
        means,
        variances,
      });
    }
    return this;
  }

  /** Log of the (unnormalised) joint score for each class. */
  private logScores(x: number[]): { label: string; score: number }[] {
    return this.classes.map(({ label, prior, means, variances }) => {
      let score = Math.log(prior);
      for (let d = 0; d < x.length; d++) {
        const v = variances[d];
        const diff = x[d] - means[d];
        score += -0.5 * Math.log(2 * Math.PI * v) - (diff * diff) / (2 * v);
      }
      return { label, score };
    });
  }

  predict(x: number[]): string {
    const scores = this.logScores(x);
    let best = scores[0];
    for (const s of scores) if (s.score > best.score) best = s;
    return best.label;
  }

  /** Normalised posterior probabilities per class (softmax over log-scores). */
  predictProba(x: number[]): Record<string, number> {
    const scores = this.logScores(x);
    const max = Math.max(...scores.map((s) => s.score));
    let total = 0;
    const exp = scores.map((s) => {
      const e = Math.exp(s.score - max);
      total += e;
      return { label: s.label, e };
    });
    const out: Record<string, number> = {};
    for (const { label, e } of exp) out[label] = e / total;
    return out;
  }

  get isFitted(): boolean {
    return this.classes.length > 0;
  }
}
